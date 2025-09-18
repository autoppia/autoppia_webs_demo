import { prescriptions } from "@/data/prescriptions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventButton } from "@/components/event-button";

export default function PrescriptionsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Prescriptions</h1>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.medicineName}</TableCell>
                <TableCell>{p.dosage}</TableCell>
                <TableCell>{p.doctorName}</TableCell>
                <TableCell>{p.startDate}</TableCell>
                <TableCell className="text-right">
                  <EventButton event="view-prescription" payload={{ id: p.id }}>
                    View Prescription
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
