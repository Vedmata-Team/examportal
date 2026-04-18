"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGetMe } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
  { href: "/student/chapters", label: "Chapters", icon: "bi-journal-bookmark-fill" },
  { href: "/student/results", label: "Results", icon: "bi-award-fill" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useGetMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isQuizRoute = pathname.startsWith("/student/quiz/");

  if (isQuizRoute) {
    return <div className="h-screen w-screen overflow-hidden bg-background">{children}</div>;
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    queryClient.clear();
    router.push("/");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-sidebar border-r border-sidebar-border h-full overflow-hidden">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <i className="bi bi-book-half text-white text-base" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground tracking-tight leading-none">ExamPlatform</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Student Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-sidebar-foreground/40">Navigation</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}>
                    {isActive && (
                      <motion.div
                        layoutId="activeStudentNav"
                        className="absolute inset-0 bg-primary rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <i className={`bi ${item.icon} text-sm shrink-0 ${isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-primary"}`} />
                    <span>{item.label}</span>
                    {isActive && <i className="bi bi-chevron-right ml-auto text-white/50 text-[10px]" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/60 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <i className="bi bi-person-fill text-primary text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">{user?.email ?? "Student"}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-black">Student</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all"
          >
            <i className="bi bi-box-arrow-right text-sm" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between px-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <i className="bi bi-book-half text-white text-xs" />
          </div>
          <span className="text-sm font-black text-foreground">ExamPlatform</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg bg-sidebar-accent text-sidebar-foreground">
          <i className="bi bi-list text-base" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl"
            >
              <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <i className="bi bi-book-half text-white text-base" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">ExamPlatform</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Student Portal</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground">
                  <i className="bi bi-x-lg text-sm" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-0.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-primary text-white shadow-md shadow-primary/25" : "text-sidebar-foreground/70 hover:bg-sidebar-accent"}`}>
                          <i className={`bi ${item.icon} text-sm shrink-0 ${isActive ? "text-white" : "text-sidebar-foreground/50"}`} />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>
              <div className="px-3 py-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/60 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
                    <i className="bi bi-person-fill text-primary text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{user?.email ?? "Student"}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-black">Student</p>
                  </div>
                </div>
                <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all">
                  <i className="bi bi-box-arrow-right text-sm" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="hidden md:flex h-14 shrink-0 items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm">
          <div>
            <p className="text-sm font-black text-foreground capitalize">
              {navItems.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"))?.label ?? "Dashboard"}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 text-xs font-bold text-muted-foreground">
            <i className="bi bi-person-fill text-primary text-sm" />
            {user?.email ?? "Student"}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 pt-16 md:pt-6 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
