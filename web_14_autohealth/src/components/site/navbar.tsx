import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold text-emerald-700">
          AutoHealth
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/appointments"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Appointments
          </Link>
          <Link
            href="/doctors"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Doctors
          </Link>
          <Link
            href="/prescriptions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Prescriptions
          </Link>
          <Link
            href="/medical-records"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Medical Records
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/appointments">
            <Button size="sm">Book now</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
