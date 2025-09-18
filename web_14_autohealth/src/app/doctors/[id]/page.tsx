import { notFound } from "next/navigation";
import { doctors } from "@/data/doctors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EventButton } from "@/components/event-button";

export function generateStaticParams() {
  return doctors.map((d) => ({ id: d.id }));
}

export default function DoctorProfile({ params }: { params: { id: string } }) {
  const doctor = doctors.find((d) => d.id === params.id);
  if (!doctor) return notFound();

  return (
    <div className="container py-10">
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar name={doctor.name} />
          <div>
            <CardTitle className="text-xl">{doctor.name}</CardTitle>
            <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {doctor.bio} This is a demo profile. Information, schedules, and contact details are placeholders.
          </p>
          <EventButton event="contact-doctor" payload={{ doctorId: doctor.id }}>
            Contact Doctor
          </EventButton>
        </CardContent>
      </Card>
    </div>
  );
}
