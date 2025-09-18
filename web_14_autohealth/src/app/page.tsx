import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const nav = [
    { href: "/appointments", title: "Appointments", desc: "Find a slot and book online" },
    { href: "/doctors", title: "Doctors", desc: "Browse specialists and ratings" },
    { href: "/prescriptions", title: "Prescriptions", desc: "View your medications" },
    { href: "/medical-records", title: "Medical Records", desc: "Upload and review files" },
  ];

  return (
    <div className="container py-10">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Book your doctor online
        </h1>
        <p className="mt-3 text-muted-foreground">
          Simple, fast, and secure. Demo only — no sign-in, no backend.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/appointments">
            <Button size="lg">Browse Appointments</Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nav.map((n) => (
          <Link key={n.href} href={n.href}>
            <Card className="h-full transition hover:shadow-md">
              <CardHeader>
                <CardTitle>{n.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
