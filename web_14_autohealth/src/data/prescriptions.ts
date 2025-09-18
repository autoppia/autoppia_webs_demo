export type Prescription = {
  id: string;
  medicineName: string;
  dosage: string;
  doctorName: string;
  startDate: string; // YYYY-MM-DD
};

export const prescriptions: Prescription[] = [
  { id: "p1", medicineName: "Atorvastatin", dosage: "10 mg daily", doctorName: "Dr. Alice Thompson", startDate: "2025-08-01" },
  { id: "p2", medicineName: "Amoxicillin", dosage: "500 mg every 8h", doctorName: "Dr. Brian Patel", startDate: "2025-09-05" },
  { id: "p3", medicineName: "Ibuprofen", dosage: "200 mg as needed", doctorName: "Dr. Daniel Ruiz", startDate: "2025-07-18" },
];
