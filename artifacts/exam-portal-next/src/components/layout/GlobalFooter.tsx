"use client";

import Link from "next/link";

export function GlobalFooter() {
  return (
    <footer className="bg-background border-t border-border pt-10 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                <i className="bi bi-book-half text-primary-foreground text-base" />
              </div>
              <span className="text-base font-bold tracking-tight">ExamPlatform</span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Empowering global institutions with secure, advanced exam technology and data-driven insights.
            </p>
            <div className="flex gap-2">
              {[
                { icon: "bi-twitter-x", href: "#" },
                { icon: "bi-github", href: "#" },
                { icon: "bi-linkedin", href: "#" },
                { icon: "bi-envelope-at", href: "#" }
              ].map((social, i) => (
                <Link key={i} href={social.href} className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all interactive-hover">
                  <i className={`bi ${social.icon} text-sm`} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm flex items-center gap-1.5">
              <i className="bi bi-rocket-takeoff text-primary text-xs" />
              Product
            </h4>
            <ul className="space-y-2 text-muted-foreground font-medium text-xs">
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Features</Link></li>
              <li><Link href="/demo-content" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Live Demo</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Integrations</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm flex items-center gap-1.5">
              <i className="bi bi-building text-primary text-xs" />
              Company
            </h4>
            <ul className="space-y-2 text-muted-foreground font-medium text-xs">
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Privacy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm flex items-center gap-1.5">
              <i className="bi bi-headset text-primary text-xs" />
              Support
            </h4>
            <ul className="space-y-2 text-muted-foreground font-medium text-xs">
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Documentation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Community</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-1"><i className="bi bi-dot" /> Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground font-medium">
          <p className="flex items-center gap-1.5">
            <i className="bi bi-c-circle" /> 2026 Vedmata-Team. Shaping the future of education.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-primary transition-colors">Status</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
