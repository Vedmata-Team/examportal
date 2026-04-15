"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { GlobalFooter } from "./GlobalFooter";
import { MobileBottomNav } from "./MobileBottomNav";

const SHELL_EXCLUDED = ["/admin", "/student"];

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = SHELL_EXCLUDED.some((prefix) => pathname.startsWith(prefix));

  if (isAppRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <GlobalFooter />
      <MobileBottomNav />
    </>
  );
}
