export type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // ISO or human-readable
  time: string; // e.g., 10:30 AM
};

export const appointments: Appointment[] = [
  { id: "a1", doctorId: "d1", doctorName: "Dr. Alice Thompson", specialty: "Cardiology", date: "2025-09-20", time: "09:00 AM" },
  { id: "a2", doctorId: "d2", doctorName: "Dr. Brian Patel", specialty: "Dermatology", date: "2025-09-20", time: "11:30 AM" },
  { id: "a3", doctorId: "d3", doctorName: "Dr. Clara Nguyen", specialty: "Pediatrics", date: "2025-09-21", time: "02:00 PM" },
  { id: "a4", doctorId: "d4", doctorName: "Dr. Daniel Ruiz", specialty: "Orthopedics", date: "2025-09-22", time: "10:15 AM" },
  { id: "a5", doctorId: "d1", doctorName: "Dr. Alice Thompson", specialty: "Cardiology", date: "2025-09-23", time: "03:45 PM" },
];
