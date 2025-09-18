import { appointments } from "@/data/appointments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventButton } from "@/components/event-button";

export default function AppointmentsPage() {
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
                  <EventButton event="book-appointment" payload={{ id: a.id }}>
                    Book Appointment
                  </EventButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
