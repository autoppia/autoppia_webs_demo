export type Prescription = {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  doctorName: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: "active" | "completed" | "discontinued" | "refill_needed";
  category: "cardiovascular" | "antibiotic" | "pain_management" | "diabetes" | "blood_pressure" | "cholesterol" | "thyroid" | "vitamin" | "other";
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

export const prescriptions: Prescription[] = [
  {
    id: "p1",
    medicineName: "Atorvastatin",
    genericName: "Lipitor",
    dosage: "10 mg daily",
    doctorName: "Dr. Alice Thompson",
    startDate: "2024-08-01",
    status: "active",
    category: "cholesterol",
    instructions: "Take with food in the evening. Avoid grapefruit juice. Regular blood tests required.",
    sideEffects: ["Muscle pain", "Digestive issues", "Liver problems (rare)"],
    warnings: ["Do not take with grapefruit", "Monitor liver function", "Report muscle pain"],
    refillsRemaining: 3,
    totalRefills: 5,
    pharmacy: "CVS Pharmacy - Main St",
    prescriptionNumber: "RX-2024-001234",
    cost: 15.99,
    insuranceCoverage: true
  },
  {
    id: "p2",
    medicineName: "Amoxicillin",
    genericName: "Amoxil",
    dosage: "500 mg every 8 hours",
    doctorName: "Dr. Brian Patel",
    startDate: "2024-09-05",
    endDate: "2024-09-19",
    status: "completed",
    category: "antibiotic",
    instructions: "Take with or without food. Complete the full course even if feeling better.",
    sideEffects: ["Nausea", "Diarrhea", "Allergic reactions"],
    warnings: ["Complete full course", "May cause yeast infections", "Avoid alcohol"],
    refillsRemaining: 0,
    totalRefills: 0,
    pharmacy: "Walgreens - Oak Ave",
    prescriptionNumber: "RX-2024-001567",
    cost: 8.50,
    insuranceCoverage: true
  },
  {
    id: "p3",
    medicineName: "Ibuprofen",
    genericName: "Advil",
    dosage: "200 mg as needed",
    doctorName: "Dr. Daniel Ruiz",
    startDate: "2024-07-18",
    status: "active",
    category: "pain_management",
    instructions: "Take with food or milk. Do not exceed 6 tablets per day. Use for pain or inflammation.",
    sideEffects: ["Stomach upset", "Dizziness", "Headache"],
    warnings: ["Take with food", "Do not exceed recommended dose", "Avoid if allergic to aspirin"],
    refillsRemaining: 2,
    totalRefills: 3,
    pharmacy: "Rite Aid - Central Plaza",
    prescriptionNumber: "RX-2024-000891",
    cost: 12.75,
    insuranceCoverage: true
  },
  {
    id: "p4",
    medicineName: "Metformin",
    genericName: "Glucophage",
    dosage: "500 mg twice daily",
    doctorName: "Dr. Alice Thompson",
    startDate: "2024-06-15",
    status: "active",
    category: "diabetes",
    instructions: "Take with meals to reduce stomach upset. Start with once daily for first week.",
    sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
    warnings: ["Take with food", "Monitor blood sugar", "Stay hydrated"],
    refillsRemaining: 4,
    totalRefills: 6,
    pharmacy: "CVS Pharmacy - Main St",
    prescriptionNumber: "RX-2024-000456",
    cost: 4.99,
    insuranceCoverage: true
  },
  {
    id: "p5",
    medicineName: "Lisinopril",
    genericName: "Prinivil",
    dosage: "10 mg daily",
    doctorName: "Dr. Alice Thompson",
    startDate: "2024-05-20",
    status: "active",
    category: "blood_pressure",
    instructions: "Take at the same time each day. Monitor blood pressure regularly.",
    sideEffects: ["Dry cough", "Dizziness", "Fatigue"],
    warnings: ["Monitor blood pressure", "Report persistent cough", "Avoid potassium supplements"],
    refillsRemaining: 1,
    totalRefills: 4,
    pharmacy: "CVS Pharmacy - Main St",
    prescriptionNumber: "RX-2024-000234",
    cost: 6.25,
    insuranceCoverage: true
  },
  {
    id: "p6",
    medicineName: "Levothyroxine",
    genericName: "Synthroid",
    dosage: "50 mcg daily",
    doctorName: "Dr. Clara Nguyen",
    startDate: "2024-04-10",
    status: "active",
    category: "thyroid",
    instructions: "Take on empty stomach, 30-60 minutes before breakfast. Take at same time daily.",
    sideEffects: ["Weight changes", "Hair loss", "Nervousness"],
    warnings: ["Take on empty stomach", "Regular blood tests needed", "Do not stop suddenly"],
    refillsRemaining: 2,
    totalRefills: 3,
    pharmacy: "Walgreens - Oak Ave",
    prescriptionNumber: "RX-2024-000123",
    cost: 9.99,
    insuranceCoverage: true
  },
  {
    id: "p7",
    medicineName: "Vitamin D3",
    genericName: "Cholecalciferol",
    dosage: "1000 IU daily",
    doctorName: "Dr. Alice Thompson",
    startDate: "2024-03-01",
    status: "active",
    category: "vitamin",
    instructions: "Take with a meal containing fat for better absorption. Take at same time daily.",
    sideEffects: ["Nausea", "Constipation", "Kidney stones (rare)"],
    warnings: ["Take with food", "Do not exceed recommended dose", "Monitor calcium levels"],
    refillsRemaining: 0,
    totalRefills: 2,
    pharmacy: "CVS Pharmacy - Main St",
    prescriptionNumber: "RX-2024-000789",
    cost: 18.50,
    insuranceCoverage: false
  },
  {
    id: "p8",
    medicineName: "Omeprazole",
    genericName: "Prilosec",
    dosage: "20 mg daily",
    doctorName: "Dr. Michael Chen",
    startDate: "2024-02-15",
    endDate: "2024-08-15",
    status: "discontinued",
    category: "other",
    instructions: "Take before breakfast. Do not crush or chew. Use for acid reflux.",
    sideEffects: ["Headache", "Nausea", "Vitamin B12 deficiency"],
    warnings: ["Take before meals", "Long-term use may affect bone health", "Monitor magnesium levels"],
    refillsRemaining: 0,
    totalRefills: 0,
    pharmacy: "Rite Aid - Central Plaza",
    prescriptionNumber: "RX-2024-000345",
    cost: 22.99,
    insuranceCoverage: true
  },
  {
    id: "p9",
    medicineName: "Albuterol",
    genericName: "Proventil",
    dosage: "90 mcg as needed",
    doctorName: "Dr. Sarah Johnson",
    startDate: "2024-01-20",
    status: "refill_needed",
    category: "other",
    instructions: "Use inhaler as needed for breathing difficulties. Shake well before use.",
    sideEffects: ["Nervousness", "Tremor", "Rapid heartbeat"],
    warnings: ["Use as directed", "Do not exceed recommended dose", "Seek help if symptoms worsen"],
    refillsRemaining: 0,
    totalRefills: 2,
    pharmacy: "Walgreens - Oak Ave",
    prescriptionNumber: "RX-2024-000567",
    cost: 35.00,
    insuranceCoverage: true
  },
  {
    id: "p10",
    medicineName: "Multivitamin",
    genericName: "Centrum Silver",
    dosage: "1 tablet daily",
    doctorName: "Dr. Alice Thompson",
    startDate: "2024-01-01",
    status: "active",
    category: "vitamin",
    instructions: "Take with food. Do not exceed recommended dose. Store in cool, dry place.",
    sideEffects: ["Nausea", "Constipation", "Stomach upset"],
    warnings: ["Take with food", "Keep out of reach of children", "Do not exceed recommended dose"],
    refillsRemaining: 1,
    totalRefills: 2,
    pharmacy: "CVS Pharmacy - Main St",
    prescriptionNumber: "RX-2024-000012",
    cost: 24.99,
    insuranceCoverage: false
  }
];
