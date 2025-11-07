import { notFound } from "next/navigation";
import { doctors } from "@/data/doctors";
import { DoctorProfileClient } from "./doctor-profile-client";

export function generateStaticParams() {
  return doctors.map((d) => ({ id: d.id }));
}

export default async function DoctorProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = doctors.find((d) => d.id === id);
  if (!doctor) return notFound();

  return <DoctorProfileClient doctor={doctor} />;
}
