import { UserMenu } from "@/components/dashboard/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/lib/auth";
import { BarChart3 } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const currentYear = new Date().getFullYear();
  const copyrightYear = currentYear === 2026 ? "2026" : `2026–${currentYear}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BarChart3 className="text-primary h-6 w-6" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight">
              lux.dev{" "}
              <span className="text-muted-foreground font-normal">/</span>{" "}
              <span className="text-primary">winrate</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {copyrightYear} lux.dev. All rights reserved.
          </p>
          <nav className="text-muted-foreground flex gap-6 text-xs">
            <Link
              href="https://parsertime.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Parsertime
            </Link>
            <Link
              href="https://lux.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              lux.dev
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
