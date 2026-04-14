"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useGetMe } from "@workspace/api-client-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: user } = useGetMe();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => setIsOpen(false), [pathname]);

  const guestLinks = [
    { href: "/", label: "Home", icon: "bi-house-heart" },
    { href: "/about", label: "Features", icon: "bi-bookmark-heart" },
    { href: "/demo-content", label: "Demo", icon: "bi-play-circle" },
  ];

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
    { href: "/student/chapters", label: "Courses", icon: "bi-journal-bookmark" },
    { href: "/student/results", label: "Results", icon: "bi-award" },
  ];

  const links = user ? studentLinks : guestLinks;

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "glass shadow-lg" : "bg-transparent py-4 md:py-6"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-primary p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/30">
            <i className="bi bi-book-half text-primary-foreground text-2xl" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            ExamPlatform
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 ${pathname === link.href ? "text-primary bg-primary/5 px-3 py-1.5 rounded-full shadow-sm" : "text-muted-foreground hover:text-primary"}`}
            >
              <i className={`bi ${link.icon} text-lg`} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href="/student/dashboard">
              <Button className="shadow-lg shadow-primary/20 rounded-xl px-6 h-12 text-base font-bold interactive-hover flex items-center gap-2">
                <i className="bi bi-speedometer2" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" className="rounded-xl font-bold px-4 h-12 flex items-center gap-2">
                  <i className="bi bi-box-arrow-in-right" />
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="shadow-lg shadow-primary/20 rounded-xl px-6 h-12 text-base font-bold interactive-hover flex items-center gap-2">
                  <i className="bi bi-person-plus" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden p-3 rounded-2xl bg-card border border-white/10 shadow-lg interactive-hover"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <i className="bi bi-x-lg text-xl" /> : <i className="bi bi-list text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="flex flex-row gap-2 flex-wrap">
                {links.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all ${pathname === link.href ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/5 hover:bg-primary/10 text-foreground"}`}
                  >
                    <i className={`bi ${link.icon} text-base`} />
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-row gap-2 pt-2 border-t border-white/10">
                {user ? (
                  <Link href="/student/dashboard" className="flex-1">
                    <Button className="w-full h-9 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      <i className="bi bi-speedometer2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in" className="flex-1">
                      <Button variant="outline" className="w-full h-9 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                        <i className="bi bi-box-arrow-in-right" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="flex-1">
                      <Button className="w-full h-9 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                        <i className="bi bi-person-plus" />
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
