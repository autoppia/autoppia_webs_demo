"use client";

import { useState } from "react";
import { appointments } from "@/data/appointments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AppointmentBookingModal } from "@/components/appointment-booking-modal";
import { logEvent, EVENT_TYPES } from "@/library/events";
import type { Appointment } from "@/data/appointments";

export default function AppointmentsPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookAppointment = (appointment: Appointment) => {
    // Log the initial booking attempt
    logEvent(EVENT_TYPES.BOOK_APPOINTMENT, {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      date: appointment.date,
      time: appointment.time,
      action: "open_booking_modal",
      source: "appointments_page",
      modalOpenTime: new Date().toISOString()
    });

    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Available Appointments</h1>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.doctorName}</TableCell>
                <TableCell>{a.specialty}</TableCell>
                <TableCell>{a.date}</TableCell>
                <TableCell>{a.time}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => handleBookAppointment(a)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Book Appointment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AppointmentBookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
}
