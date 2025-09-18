import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container grid gap-4 py-8 md:grid-cols-3">
        <div>
          <div className="font-semibold text-emerald-700">AutoHealth</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Demo healthcare portal for AI agents training.
          </p>
        </div>
        <div className="flex gap-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Company</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Legal</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} AutoHealth. Demo only.
        </div>
      </div>
    </footer>
  );
}
