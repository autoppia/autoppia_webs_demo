export type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image?: string;
  bio: string;
  experience: number;
  education: string[];
  certifications: string[];
  languages: string[];
  hospitalAffiliations: string[];
  officeLocation: string;
  phone: string;
  email: string;
  consultationFee: number;
  insuranceAccepted: string[];
  availability: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  specialties: string[];
  patientReviews: {
    rating: number;
    comment: string;
    patientName: string;
    date: string;
  }[];
  awards: string[];
  publications: string[];
  procedures: string[];
};

export type Prescription = {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  doctorName: string;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "discontinued" | "refill_needed";
  category:
    | "cardiovascular"
    | "antibiotic"
    | "pain_management"
    | "diabetes"
    | "blood_pressure"
    | "cholesterol"
    | "thyroid"
    | "vitamin"
    | "other";
  instructions: string;
  sideEffects?: string[];
  warnings?: string[];
  refillsRemaining?: number;
  totalRefills?: number;
  pharmacy?: string;
  prescriptionNumber?: string;
  cost?: number;
  insuranceCoverage?: boolean;
};

export type MedicalRecord = {
  id: string;
  type:
    | "lab_result"
    | "imaging"
    | "vaccination"
    | "visit_summary"
    | "prescription_history"
    | "allergy"
    | "vital_signs"
    | "procedure";
  title: string;
  date: string;
  doctorName?: string;
  facility?: string;
  description: string;
  status: "normal" | "abnormal" | "pending" | "reviewed";
  category: "diagnostic" | "preventive" | "treatment" | "monitoring";
  fileUrl?: string;
  values?: Record<string, string | number>;
};
