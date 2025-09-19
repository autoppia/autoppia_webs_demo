"use client";

import Link from "next/link";
import { doctors } from "@/data/doctors";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EventButton } from "@/components/event-button";
import { Star } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";

function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const active = value >= i + 1 - 1e-6 || value > i && value < i + 1; // show full for simplicity
    return (
      <Star key={i} className={`h-4 w-4 ${active ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
    );
  });
  return <div className="flex items-center gap-1">{stars}</div>;
}

export default function DoctorsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Doctors</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => (
          <Card key={d.id} className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4">
              <Avatar name={d.name} />
              <div>
                <CardTitle className="text-lg">{d.name}</CardTitle>
                <div className="text-sm text-muted-foreground">{d.specialty}</div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Stars value={d.rating} />
              <p className="mt-3 text-sm text-muted-foreground">{d.bio}</p>
            </CardContent>
            <CardFooter className="mt-auto flex gap-2">
              <Link href={`/doctors/${d.id}`}>
                <Button 
                  variant="outline"
                  onClick={() => logEvent(EVENT_TYPES.VIEW_DOCTOR_PROFILE, {
                    doctorId: d.id,
                    doctorName: d.name,
                    specialty: d.specialty,
                    rating: d.rating
                  })}
                >
                  View Profile
                </Button>
              </Link>
              <EventButton 
                event="BOOK_APPOINTMENT" 
                payload={{ 
                  doctorId: d.id, 
                  doctorName: d.name, 
                  specialty: d.specialty, 
                  rating: d.rating 
                }}
              >
                Book Now
              </EventButton>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
