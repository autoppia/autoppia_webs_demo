"use client";

import { useState } from "react";
import { appointments } from "@/data/appointments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AppointmentBookingModal } from "@/components/appointment-booking-modal";
import { logEvent, EVENT_TYPES } from "@/library/events";
import type { Appointment } from "@/data/appointments";
import { useSeedLayout } from "@/library/useSeedLayout";
import { DynamicElement } from "@/components/DynamicElement";

export default function AppointmentsPage() {
  const { reorderElements, getText, getElementAttributes } = useSeedLayout();
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
      <h1 className="text-2xl font-semibold" {...getElementAttributes('apts-heading', 0)}>{getText('apts-heading', 'Available Appointments')}</h1>
      <div className="mt-6">
        {(() => {
          const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
          const hasSeed = !!(sp?.get('seed-structure') || sp?.get('seed'));

          // Column definitions (keys drive order of headers/cells)
          const columns = [
            { key: 'doctor', header: getText('apts-col-doctor', 'Doctor') },
            { key: 'specialty', header: getText('apts-col-specialty', 'Specialty') },
            { key: 'date', header: getText('apts-col-date', 'Date') },
            { key: 'time', header: getText('apts-col-time', 'Time') },
            { key: 'action', header: getText('apts-col-action', 'Action'), align: 'right' as const },
          ];
          const orderedColumns = hasSeed ? reorderElements(columns) : columns;

          // Row ordering
          const rows = hasSeed ? reorderElements(appointments) : appointments;

          return (
        <Table>
          <TableHeader>
            <TableRow>
              {orderedColumns.map((c, ci) => (
                <TableHead key={c.key} className={c.align === 'right' ? 'text-right' : undefined} {...getElementAttributes('apts-col', ci)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a, ri) => (
              <DynamicElement key={a.id} elementType="appointment-row" as="tr" index={ri}>
                {orderedColumns.map((c) => {
                  if (c.key === 'doctor') return <TableCell key={c.key}>{a.doctorName}</TableCell>;
                  if (c.key === 'specialty') return <TableCell key={c.key}>{a.specialty}</TableCell>;
                  if (c.key === 'date') return <TableCell key={c.key}>{a.date}</TableCell>;
                  if (c.key === 'time') return <TableCell key={c.key}>{a.time}</TableCell>;
                  if (c.key === 'action') return (
                    <TableCell key={c.key} className="text-right">
                      <Button 
                        onClick={() => handleBookAppointment(a)}
                        className="bg-blue-600 hover:bg-blue-700"
                        {...getElementAttributes('apts-book-button', ri)}
                      >
                        {getText('apts-book-button', 'Book Appointment')}
                      </Button>
                    </TableCell>
                  );
                  return null;
                })}
              </DynamicElement>
            ))}
          </TableBody>
        </Table>
          );
        })()}
      </div>

      <AppointmentBookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
}
