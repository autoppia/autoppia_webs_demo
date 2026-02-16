import type { Doctor, Appointment, Prescription, MedicalRecord } from "@/data/types";
import { initializeDoctors } from "@/data/doctors-enhanced";
import { initializeAppointments } from "@/data/appointments-enhanced";
import { initializePrescriptions } from "@/data/prescriptions-enhanced";
import { initializeMedicalRecords } from "@/data/medical-records-enhanced";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private doctors: Doctor[] = [];
  private appointments: Appointment[] = [];
  private prescriptions: Prescription[] = [];
  private medicalRecords: MedicalRecord[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private currentSeed: number | null = null;
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

  private getSeed(): number {
    // V2 rule: if V2 is disabled, always act as seed=1.
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return getSeedFromUrl();
  }

  private async initialize(): Promise<void> {
    // Reset ready state when initializing (in case of seed change)
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    try {
      const seed = this.getSeed();
      this.currentSeed = seed;

      // Initialize doctors first, then use them for other data types
      const doctors = await initializeDoctors(seed);
      this.setDoctors(doctors);

      // Initialize other data types in parallel
      const [appointments, prescriptions, medicalRecords] = await Promise.all([
        initializeAppointments(doctors, seed),
        initializePrescriptions(doctors, seed),
        initializeMedicalRecords(doctors, seed),
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
      this.ready = true;
      this.resolveReady();
    }
  }

  public reloadIfSeedChanged(seed?: number | null): void {
    const targetSeed = seed !== undefined && seed !== null ? seed : this.getSeed();
    if (targetSeed !== this.currentSeed) {
      this.reload(targetSeed);
    }
  }

  public async reload(seedValue?: number | null): Promise<void> {
    // If already reloading, return the existing promise
    if (this.reloadPromise) {
      return this.reloadPromise;
    }

    this.reloadPromise = (async () => {
      try {
        const seed = clampSeed(seedValue ?? this.getSeed());
        this.currentSeed = seed;

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
        this.ready = true;
        this.resolveReady();
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
    return isV2Enabled();
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampSeed(seed ?? 1) };
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
