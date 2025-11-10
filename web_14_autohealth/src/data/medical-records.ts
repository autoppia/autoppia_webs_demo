export type MedicalRecord = {
  id: string;
  type: "lab_result" | "imaging" | "vaccination" | "visit_summary" | "prescription_history" | "allergy" | "vital_signs" | "procedure";
  title: string;
  date: string; // YYYY-MM-DD
  doctorName?: string;
  facility?: string;
  description: string;
  status: "normal" | "abnormal" | "pending" | "reviewed";
  category: "diagnostic" | "preventive" | "treatment" | "monitoring";
  fileUrl?: string; // For uploaded files
  values?: Record<string, string | number>; // For lab results, vital signs, etc.
};

export const medicalRecords: MedicalRecord[] = [
  // Lab Results
  {
    id: "mr1",
    type: "lab_result",
    title: "Complete Blood Count (CBC)",
    date: "2024-01-15",
    doctorName: "Dr. Alice Thompson",
    facility: "City Medical Lab",
    description: "Routine blood work including red blood cells, white blood cells, and platelets",
    status: "normal",
    category: "diagnostic",
    values: {
      "White Blood Cells": "7.2 K/μL",
      "Red Blood Cells": "4.5 M/μL", 
      "Hemoglobin": "14.2 g/dL",
      "Hematocrit": "42.1%",
      "Platelets": "285 K/μL"
    }
  },
  {
    id: "mr2",
    type: "lab_result",
    title: "Lipid Panel",
    date: "2024-01-15",
    doctorName: "Dr. Alice Thompson",
    facility: "City Medical Lab",
    description: "Cholesterol and triglyceride levels",
    status: "normal",
    category: "diagnostic",
    values: {
      "Total Cholesterol": "185 mg/dL",
      "HDL Cholesterol": "52 mg/dL",
      "LDL Cholesterol": "118 mg/dL",
      "Triglycerides": "95 mg/dL"
    }
  },
  {
    id: "mr3",
    type: "lab_result",
    title: "Thyroid Function Test",
    date: "2024-02-10",
    doctorName: "Dr. Clara Nguyen",
    facility: "Endocrine Center",
    description: "TSH, T3, and T4 levels to assess thyroid function",
    status: "normal",
    category: "diagnostic",
    values: {
      "TSH": "2.1 mIU/L",
      "Free T4": "1.2 ng/dL",
      "Free T3": "3.1 pg/mL"
    }
  },

  // Imaging Results
  {
    id: "mr4",
    type: "imaging",
    title: "Chest X-Ray",
    date: "2024-01-20",
    doctorName: "Dr. Brian Patel",
    facility: "Radiology Associates",
    description: "Routine chest X-ray showing clear lungs and normal heart size",
    status: "normal",
    category: "diagnostic",
    fileUrl: "/images/chest-xray-2024-01-20.pdf"
  },
  {
    id: "mr5",
    type: "imaging",
    title: "MRI - Lower Back",
    date: "2024-02-05",
    doctorName: "Dr. Daniel Ruiz",
    facility: "Advanced Imaging Center",
    description: "MRI of lumbar spine showing mild disc degeneration at L4-L5",
    status: "abnormal",
    category: "diagnostic",
    fileUrl: "/images/mri-lumbar-2024-02-05.pdf"
  },

  // Vaccinations
  {
    id: "mr6",
    type: "vaccination",
    title: "COVID-19 Booster",
    date: "2024-01-10",
    doctorName: "Dr. Sarah Johnson",
    facility: "Community Health Center",
    description: "Updated COVID-19 booster vaccination",
    status: "reviewed",
    category: "preventive",
    values: {
      "Vaccine": "Pfizer-BioNTech",
      "Lot Number": "PF123456",
      "Dose": "Booster"
    }
  },
  {
    id: "mr7",
    type: "vaccination",
    title: "Annual Flu Shot",
    date: "2023-10-15",
    doctorName: "Dr. Sarah Johnson",
    facility: "Community Health Center",
    description: "Seasonal influenza vaccination",
    status: "reviewed",
    category: "preventive",
    values: {
      "Vaccine": "Fluzone Quadrivalent",
      "Lot Number": "FQ789012",
      "Season": "2023-2024"
    }
  },

  // Visit Summaries
  {
    id: "mr8",
    type: "visit_summary",
    title: "Annual Physical Exam",
    date: "2024-01-15",
    doctorName: "Dr. Alice Thompson",
    facility: "City Medical Center",
    description: "Comprehensive annual physical examination with health screening",
    status: "reviewed",
    category: "preventive",
    values: {
      "Blood Pressure": "120/80 mmHg",
      "Heart Rate": "72 bpm",
      "Weight": "165 lbs",
      "Height": "5'8\"",
      "BMI": "25.1"
    }
  },
  {
    id: "mr9",
    type: "visit_summary",
    title: "Dermatology Consultation",
    date: "2024-02-12",
    doctorName: "Dr. Brian Patel",
    facility: "Skin Care Specialists",
    description: "Annual skin check and mole evaluation",
    status: "reviewed",
    category: "preventive",
    values: {
      "Skin Type": "Type II",
      "Moles Checked": "12",
      "Suspicious Lesions": "0",
      "Recommendation": "Continue annual screening"
    }
  },

  // Vital Signs
  {
    id: "mr10",
    type: "vital_signs",
    title: "Blood Pressure Monitoring",
    date: "2024-02-20",
    doctorName: "Dr. Alice Thompson",
    facility: "City Medical Center",
    description: "Home blood pressure monitoring results over 2 weeks",
    status: "normal",
    category: "monitoring",
    values: {
      "Average Systolic": "118 mmHg",
      "Average Diastolic": "78 mmHg",
      "Readings Taken": "28",
      "Monitoring Period": "14 days"
    }
  },

  // Allergies
  {
    id: "mr11",
    type: "allergy",
    title: "Allergy Assessment",
    date: "2024-01-25",
    doctorName: "Dr. Clara Nguyen",
    facility: "Allergy & Immunology Clinic",
    description: "Comprehensive allergy testing results",
    status: "reviewed",
    category: "diagnostic",
    values: {
      "Penicillin": "Severe reaction",
      "Shellfish": "Mild reaction",
      "Pollen": "Seasonal",
      "Dust Mites": "Mild"
    }
  },

  // Procedures
  {
    id: "mr12",
    type: "procedure",
    title: "Colonoscopy",
    date: "2023-12-10",
    doctorName: "Dr. Michael Chen",
    facility: "Gastroenterology Associates",
    description: "Screening colonoscopy for colorectal cancer prevention",
    status: "normal",
    category: "preventive",
    values: {
      "Procedure": "Colonoscopy",
      "Findings": "Normal colonoscopy",
      "Polyps Found": "0",
      "Next Screening": "2028-12-10"
    }
  },

  // Prescription History
  {
    id: "mr13",
    type: "prescription_history",
    title: "Current Medications",
    date: "2024-02-15",
    doctorName: "Dr. Alice Thompson",
    facility: "City Medical Center",
    description: "Current prescription medications and dosages",
    status: "reviewed",
    category: "treatment",
    values: {
      "Lisinopril": "10mg daily",
      "Metformin": "500mg twice daily",
      "Multivitamin": "1 tablet daily",
      "Last Review": "2024-02-15"
    }
  }
];
