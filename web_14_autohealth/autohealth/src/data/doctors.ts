export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number; // 0-5
  image?: string;
  bio: string;
};

export const doctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Alice Thompson",
    specialty: "Cardiology",
    rating: 4.8,
    image: undefined,
    bio: "Experienced cardiologist focused on preventive care and patient education.",
  },
  {
    id: "d2",
    name: "Dr. Brian Patel",
    specialty: "Dermatology",
    rating: 4.5,
    image: undefined,
    bio: "Dermatologist specializing in acne treatment and skin cancer screening.",
  },
  {
    id: "d3",
    name: "Dr. Clara Nguyen",
    specialty: "Pediatrics",
    rating: 4.9,
    image: undefined,
    bio: "Pediatrician passionate about child wellness and family-centered care.",
  },
  {
    id: "d4",
    name: "Dr. Daniel Ruiz",
    specialty: "Orthopedics",
    rating: 4.6,
    image: undefined,
    bio: "Orthopedic surgeon with focus on sports injuries and minimally invasive techniques.",
  },
];
