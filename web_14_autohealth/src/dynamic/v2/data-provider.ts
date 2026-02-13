import type { Doctor, Appointment, Prescription, MedicalRecord } from "@/data/types";
import { initializeDoctors } from "@/data/doctors-enhanced";
import { initializeAppointments } from "@/data/appointments-enhanced";
import { initializePrescriptions } from "@/data/prescriptions-enhanced";
import { initializeMedicalRecords } from "@/data/medical-records-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private doctors: Doctor[] = [];
  private appointments: Appointment[] = [];
  private prescriptions: Prescription[] = [];
  private medicalRecords: MedicalRecord[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;
  private reloadPromise: Promise<void> | null = null;
  private subscribers: {
    doctors: ((doctors: Doctor[]) => void)[];
    appointments: ((appointments: Appointment[]) => void)[];
    prescriptions: ((prescriptions: Prescription[]) => void)[];
    medicalRecords: ((records: MedicalRecord[]) => void)[];
  } = {
    doctors: [],
    appointments: [],
    prescriptions: [],
    medicalRecords: [],
  };

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.initialize();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeedFromUrl(): number | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get("seed");
    if (seedParam) {
      const parsed = Number.parseInt(seedParam, 10);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 300) {
        return parsed;
      }
    }
    return null;
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autohealthV2Seed;
    if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
      return value;
    }
    return null;
  }

  private async initialize(): Promise<void> {
    // Reset ready state when initializing (in case of seed change)
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();

    try {
      // If base seed = 1, use fallback data directly (skip DB mode)
      if (baseSeed === 1) {
        console.log("[autohealth/data-provider] Base seed is 1, using fallback data");
        const doctors = await initializeDoctors(runtimeSeed ?? undefined);
        this.setDoctors(doctors);
        const [appointments, prescriptions, medicalRecords] = await Promise.all([
          initializeAppointments(doctors, runtimeSeed ?? undefined),
          initializePrescriptions(doctors, runtimeSeed ?? undefined),
          initializeMedicalRecords(doctors, runtimeSeed ?? undefined),
        ]);
        this.setAppointments(appointments);
        this.setPrescriptions(prescriptions);
        this.setMedicalRecords(medicalRecords);
        // Mark as ready after setting all data
        this.ready = true;
        this.resolveReady();
        return;
      }

      this.currentSeed = runtimeSeed ?? 1;

      // Check if DB mode is enabled - only try DB if enabled
      const dbModeEnabled = isDbLoadModeEnabled();
      console.log("[autohealth/data-provider] DB mode enabled:", dbModeEnabled, "runtimeSeed:", runtimeSeed, "baseSeed:", baseSeed);

      if (dbModeEnabled) {
        // Try DB mode first if enabled
        console.log("[autohealth/data-provider] Attempting to load from DB...");
        // Let initializeDoctors/etc handle DB loading
      }

      // Initialize doctors first, then use them for other data types
      const doctors = await initializeDoctors(runtimeSeed ?? undefined);
      this.setDoctors(doctors);

      // Initialize other data types in parallel
      const [appointments, prescriptions, medicalRecords] = await Promise.all([
        initializeAppointments(doctors, runtimeSeed ?? undefined),
        initializePrescriptions(doctors, runtimeSeed ?? undefined),
        initializeMedicalRecords(doctors, runtimeSeed ?? undefined),
      ]);

      this.setAppointments(appointments);
      this.setPrescriptions(prescriptions);
      this.setMedicalRecords(medicalRecords);

      console.log("[autohealth/data-provider] ✅ Data initialized:", {
        doctors: doctors.length,
        appointments: appointments.length,
        prescriptions: prescriptions.length,
        medicalRecords: medicalRecords.length,
      });

      // Mark as ready after setting all data
      this.ready = true;
      this.resolveReady();
    } catch (error) {
      console.error("[autohealth/data-provider] Failed to initialize data:", error);
      // Even if there's an error, we should mark as ready with fallback data
      // to prevent infinite loading state
      try {
        const doctors = await initializeDoctors(runtimeSeed ?? undefined);
        this.setDoctors(doctors);
        const [appointments, prescriptions, medicalRecords] = await Promise.all([
          initializeAppointments(doctors, runtimeSeed ?? undefined),
          initializePrescriptions(doctors, runtimeSeed ?? undefined),
          initializeMedicalRecords(doctors, runtimeSeed ?? undefined),
        ]);
        this.setAppointments(appointments);
        this.setPrescriptions(prescriptions);
        this.setMedicalRecords(medicalRecords);
        // Mark as ready after setting fallback data
        this.ready = true;
        this.resolveReady();
      } catch (fallbackError) {
        console.error("[autohealth/data-provider] Failed to initialize fallback data:", fallbackError);
        // Last resort: mark as ready to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      }
    }

    // Listen for seed changes
    if (typeof window !== "undefined") {
      window.addEventListener("autohealth:v2SeedChange", this.handleSeedEvent.bind(this));
    }
  }

  private handleSeedEvent = () => {
    console.log("[autohealth/data-provider] Seed change event received");
    this.reload();
  };

  public async reload(seedValue?: number | null): Promise<void> {
    // If already reloading, return the existing promise
    if (this.reloadPromise) {
      return this.reloadPromise;
    }

    this.reloadPromise = (async () => {
      try {
        const baseSeed = this.getBaseSeedFromUrl();
        const v2Seed = seedValue ?? this.getRuntimeV2Seed() ?? 1;

        // If base seed = 1, use fallback data directly (skip DB/AI)
        if (baseSeed === 1) {
          console.log("[autohealth/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }

        console.log(`[autohealth] Reloading data for seed=${this.currentSeed}...`);
        this.ready = false;

        // Clear existing data
        this.doctors = [];
        this.appointments = [];
        this.prescriptions = [];
        this.medicalRecords = [];

        // Notify subscribers with empty arrays
        this.notifySubscribers();

        // Reload data
        const doctors = await initializeDoctors(this.currentSeed);
        this.setDoctors(doctors);

        const [appointments, prescriptions, medicalRecords] = await Promise.all([
          initializeAppointments(doctors, this.currentSeed),
          initializePrescriptions(doctors, this.currentSeed),
          initializeMedicalRecords(doctors, this.currentSeed),
        ]);

        this.setAppointments(appointments);
        this.setPrescriptions(prescriptions);
        this.setMedicalRecords(medicalRecords);

        console.log(`[autohealth] Data reloaded: ${doctors.length} doctors, ${appointments.length} appointments, ${prescriptions.length} prescriptions, ${medicalRecords.length} medical records`);
      } catch (error) {
        console.error("[autohealth/data-provider] Failed to reload data:", error);
      } finally {
        this.ready = true;
        this.reloadPromise = null;
      }
    })();

    await this.reloadPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    // If currently reloading, wait for that to complete
    if (this.reloadPromise) {
      return this.reloadPromise;
    }
    // Otherwise return the initial ready promise
    return this.readyPromise;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Doctors
  public getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  public setDoctors(newDoctors: Doctor[]): void {
    this.doctors = newDoctors;
    this.notifyDoctorsSubscribers();
  }

  public subscribeDoctors(callback: (doctors: Doctor[]) => void): () => void {
    this.subscribers.doctors.push(callback);
    callback(this.doctors);
    return () => {
      this.subscribers.doctors = this.subscribers.doctors.filter((sub) => sub !== callback);
    };
  }

  private notifyDoctorsSubscribers(): void {
    this.subscribers.doctors.forEach((callback) => callback(this.doctors));
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.doctors.find((doctor) => doctor.id === id);
  }

  // Appointments
  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public setAppointments(newAppointments: Appointment[]): void {
    this.appointments = newAppointments;
    this.notifyAppointmentsSubscribers();
  }

  public subscribeAppointments(callback: (appointments: Appointment[]) => void): () => void {
    this.subscribers.appointments.push(callback);
    callback(this.appointments);
    return () => {
      this.subscribers.appointments = this.subscribers.appointments.filter((sub) => sub !== callback);
    };
  }

  private notifyAppointmentsSubscribers(): void {
    this.subscribers.appointments.forEach((callback) => callback(this.appointments));
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find((appointment) => appointment.id === id);
  }

  // Prescriptions
  public getPrescriptions(): Prescription[] {
    return [...this.prescriptions];
  }

  public setPrescriptions(newPrescriptions: Prescription[]): void {
    this.prescriptions = newPrescriptions;
    this.notifyPrescriptionsSubscribers();
  }

  public subscribePrescriptions(callback: (prescriptions: Prescription[]) => void): () => void {
    this.subscribers.prescriptions.push(callback);
    callback(this.prescriptions);
    return () => {
      this.subscribers.prescriptions = this.subscribers.prescriptions.filter((sub) => sub !== callback);
    };
  }

  private notifyPrescriptionsSubscribers(): void {
    this.subscribers.prescriptions.forEach((callback) => callback(this.prescriptions));
  }

  public getPrescriptionById(id: string): Prescription | undefined {
    return this.prescriptions.find((prescription) => prescription.id === id);
  }

  // Medical Records
  public getMedicalRecords(): MedicalRecord[] {
    return [...this.medicalRecords];
  }

  public setMedicalRecords(newRecords: MedicalRecord[]): void {
    this.medicalRecords = newRecords;
    this.notifyMedicalRecordsSubscribers();
  }

  public subscribeMedicalRecords(callback: (records: MedicalRecord[]) => void): () => void {
    this.subscribers.medicalRecords.push(callback);
    callback(this.medicalRecords);
    return () => {
      this.subscribers.medicalRecords = this.subscribers.medicalRecords.filter((sub) => sub !== callback);
    };
  }

  private notifyMedicalRecordsSubscribers(): void {
    this.subscribers.medicalRecords.forEach((callback) => callback(this.medicalRecords));
  }

  public getMedicalRecordById(id: string): MedicalRecord | undefined {
    return this.medicalRecords.find((record) => record.id === id);
  }

  private notifySubscribers(): void {
    this.notifyDoctorsSubscribers();
    this.notifyAppointmentsSubscribers();
    this.notifyPrescriptionsSubscribers();
    this.notifyMedicalRecordsSubscribers();
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getDoctors = () => dynamicDataProvider.getDoctors();
export const getDoctorById = (id: string) => dynamicDataProvider.getDoctorById(id);
export const subscribeDoctors = (callback: (doctors: Doctor[]) => void) => dynamicDataProvider.subscribeDoctors(callback);
export const getAppointments = () => dynamicDataProvider.getAppointments();
export const getAppointmentById = (id: string) => dynamicDataProvider.getAppointmentById(id);
export const subscribeAppointments = (callback: (appointments: Appointment[]) => void) => dynamicDataProvider.subscribeAppointments(callback);
export const getPrescriptions = () => dynamicDataProvider.getPrescriptions();
export const getPrescriptionById = (id: string) => dynamicDataProvider.getPrescriptionById(id);
export const subscribePrescriptions = (callback: (prescriptions: Prescription[]) => void) => dynamicDataProvider.subscribePrescriptions(callback);
export const getMedicalRecords = () => dynamicDataProvider.getMedicalRecords();
export const getMedicalRecordById = (id: string) => dynamicDataProvider.getMedicalRecordById(id);
export const subscribeMedicalRecords = (callback: (records: MedicalRecord[]) => void) => dynamicDataProvider.subscribeMedicalRecords(callback);
export const whenReady = () => dynamicDataProvider.whenReady();
