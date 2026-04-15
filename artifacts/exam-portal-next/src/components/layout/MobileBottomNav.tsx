"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetMe } from "@workspace/api-client-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: user } = useGetMe();

  const guestItems = [
    { href: "/", label: "Home", icon: "bi-house-heart" },
    { href: "/about", label: "Features", icon: "bi-layers" },
    { href: "/demo-content", label: "Demo", icon: "bi-play-circle" },
    { href: "/sign-in", label: "Login", icon: "bi-box-arrow-in-right" },
    { href: "/sign-up", label: "Join", icon: "bi-person-plus" },
  ];

  const studentItems = [
    { href: "/student/dashboard", label: "Home", icon: "bi-grid-1x2" },
    { href: "/student/chapters", label: "Exams", icon: "bi-pen" },
    { href: "/student-lessons", label: "Lessons", icon: "bi-journal-bookmark" },
    { href: "/student/results", label: "Stats", icon: "bi-award" },
    { href: "/student/profile", label: "Me", icon: "bi-person-circle" },
  ];

  const items = user ? studentItems : guestItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 glass border-t border-white/10 px-2 pb-1 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <div className="grid h-full grid-cols-5 font-medium">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="inline-flex flex-col items-center justify-center group"
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground -translate-y-0.5 shadow-md shadow-primary/30" : "text-muted-foreground group-active:scale-90"}`}>
                <i className={`bi ${item.icon} text-lg`} />
              </div>
              <span className={`text-[9px] mt-0.5 transition-all ${isActive ? "text-primary font-bold opacity-100" : "text-muted-foreground opacity-70"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
