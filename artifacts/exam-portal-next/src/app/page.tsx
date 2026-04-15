"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Show } from "@/components/Show";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.15 }
};

// SVG Curve Component
const WaveDivider = ({ flip = false, color = "fill-background", className = "" }: { flip?: boolean, color?: string, className?: string }) => (
  <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
    <motion.div
      className="flex w-[200%]"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
    >
      <svg className={`relative block w-1/2 h-[60px] md:h-[120px] ${color}`} viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
      <svg className={`relative block w-1/2 h-[60px] md:h-[120px] ${color}`} viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
    </motion.div>
  </div>
);

function LandingPage() {
  const words = ["Excellence", "Integrity", "Success", "Security", "Future"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background selection:bg-primary/20 overflow-x-hidden">
      <main className="relative">
        {/* Dynamic Hero Section */}
        <div className="sticky top-0 h-[100dvh] flex flex-col justify-center overflow-hidden z-0 bg-background">
          <section className="relative w-full pt-12 flex-1 flex flex-col justify-center">
            {/* Hero background grid and minimal blobs (scoped to hero) */}
          <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_20%,transparent_110%)]" />
             <div className="absolute top-[10%] left-[-10%] w-[40%] h-[60%] bg-primary/10 blur-[120px] rounded-full" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="space-y-8 text-center lg:text-left relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-xs font-black animate-pulse shadow-lg shadow-primary/5">
                  <i className="bi bi-stars text-base" />
                  India's Educational Digital Frontier
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-[0.95]">
                  Beyond <br />
                  <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-yellow-400 min-w-[180px] sm:min-w-[260px]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={words[index]}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        {words[index]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl lg:mx-0 mx-auto leading-relaxed font-medium">
                  Experience the most <span className="text-foreground font-bold">fluid</span>, <span className="text-foreground font-bold">secure</span>, and <span className="text-foreground font-bold">intelligent</span> examination ecosystem designed for the next generation of learners.
                </p>
                <div className="flex flex-row items-center gap-3 lg:justify-start justify-center pt-2 flex-wrap">
                  <Link href="/sign-up">
                    <Button size="sm" className="h-10 sm:h-12 px-5 sm:px-7 text-sm sm:text-base font-bold shadow-lg shadow-primary/30 interactive-hover rounded-xl group flex items-center gap-2">
                      Get Started <i className="bi bi-arrow-right-short text-xl group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/demo-content">
                    <Button variant="outline" size="sm" className="h-10 sm:h-12 px-5 sm:px-7 text-sm sm:text-base font-bold rounded-xl glass interactive-hover flex items-center gap-2">
                      <i className="bi bi-play-btn text-primary" />
                      Explore Demo
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50" />
                <div className="relative glass p-6 rounded-[3rem] border-white/20 shadow-2xl interactive-hover overflow-hidden">
                  <img src="/hero.png" alt="Hero" className="w-full h-auto rounded-[1.5rem]" />
                  <div className="absolute top-10 right-10 p-5 glass rounded-2xl border-white/20 shadow-2xl animate-bounce">
                    <i className="bi bi-cursor text-3xl text-primary" />
                  </div>
                  <div className="absolute bottom-10 left-10 p-4 glass rounded-xl border-white/20 shadow-xl flex items-center gap-3">
                     <i className="bi bi-shield-check text-2xl text-emerald-500" />
                     <span className="text-sm font-bold">Secure Testing active</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        </div>

        <div className="relative z-10 flex flex-col">
          <div className="bg-transparent">
             <WaveDivider color="fill-background" />
          </div>
          <div className="bg-background">
             <div className="-mt-[60px] md:-mt-[120px] pointer-events-none">
                <WaveDivider color="fill-muted/50" />
             </div>

             {/* Dynamic Features */}
             <section className="py-14 sm:py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-10 sm:mb-16">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-sm">
                <i className="bi bi-boxes mr-2" />
                The Core Platform
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight flex flex-wrap items-center justify-center gap-3">
                <span className="flex items-center gap-2"><i className="bi bi-magic text-primary" /> Interactive.</span>
                <span className="flex items-center gap-2"><i className="bi bi-lock text-primary" /> Secure.</span>
                <span className="underline decoration-primary/30 decoration-4 underline-offset-8 italic">Unstoppable.</span>
              </h2>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="grid sm:grid-cols-3 gap-5 sm:gap-8"
            >
              {[
                { title: "Hierarchical Admin", desc: "Manage thousands from one dashboard with fluid permissions.", icon: "bi-layers", img: "/feature-admin.png", color: "from-blue-600/20 to-blue-600/5" },
                { title: "AI Quizzes", desc: "Intelligent question engines with real-time proctoring.", icon: "bi-lightning-charge", img: "/feature-quiz.png", color: "from-orange-600/20 to-orange-600/5" },
                { title: "Military Security", desc: "Encryption and lockdown modes for zero-compromise tests.", icon: "bi-shield-lock", img: "/feature-security.png", color: "from-emerald-600/20 to-emerald-600/5" }
              ].map((f, i) => (
                <motion.div key={i} variants={fadeInUp} className="group">
                  <div className={`h-full bg-gradient-to-br ${f.color} rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-1 interactive-hover overflow-hidden shadow-xl`}>
                    <div className="bg-background/40 backdrop-blur-md rounded-xl sm:rounded-[2.3rem] p-5 sm:p-8 h-full flex flex-col gap-5">
                       <div className="aspect-video relative rounded-xl sm:rounded-[1.5rem] overflow-hidden shadow-2xl">
                          <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                       </div>
                       <div className="space-y-2">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <i className={`bi ${f.icon} text-xl sm:text-2xl`} />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-black tracking-tight">{f.title}</h3>
                          <p className="text-muted-foreground leading-relaxed font-medium text-xs sm:text-sm">{f.desc}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <WaveDivider flip color="fill-muted/50" />

        {/* Interactive Stats */}
        <section className="py-16 sm:py-24 relative overflow-hidden bg-background">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { label: "Active Students", value: "850k+", icon: "bi bi-people" },
              { label: "Tests Delivered", value: "2.5M+", icon: "bi bi-shield-check" },
              { label: "Global Reach", value: "120+", icon: "bi bi-globe-central-south-asia" },
              { label: "Trust Score", value: "4.9/5", icon: "bi bi-trophy" }
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                className="group relative p-5 sm:p-8 glass rounded-2xl sm:rounded-[2.5rem] interactive-hover shadow-xl"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                   <i className={`${s.icon} text-base sm:text-xl`} />
                </div>
                <h4 className="text-2xl sm:text-4xl font-black text-foreground pt-4 tracking-tighter">{s.value}</h4>
                <p className="text-muted-foreground font-black mt-1 uppercase tracking-[0.1em] text-[9px] sm:text-xs">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="bg-muted/50">
          <WaveDivider color="fill-background" />
        </div>

        {/* How It Works with Curves */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4">
             <div className="text-center mb-12 sm:mb-20 space-y-3">
               <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter flex items-center justify-center gap-3">
                 <i className="bi bi-cpu text-primary" />
                 Simplified <span className="text-primary italic">Success</span>
               </h2>
               <p className="text-muted-foreground text-sm sm:text-lg font-bold max-w-2xl mx-auto">Revolutionary efficiency in three simple layers.</p>
             </div>
             
             <div className="space-y-16 sm:space-y-28">
                {[
                  { title: "Seamless Setup", desc: "Integrate your institution's data with one-click hierarchical mapping. Define schools, centers, and sections in minutes.", icon: "bi bi-globe-asia-australia", img: "/hero.png" },
                  { title: "Fluid Authoring", desc: "Our rich-text editor allows for complex diagrams, multi-language support, and dynamic question types.", icon: "bi bi-mortarboard", img: "/feature-quiz.png" },
                  { title: "Instant Analysis", desc: "Real-time results with proctoring audit logs. Performance reports delivered instantly to students and parents.", icon: "bi bi-graph-up-arrow", img: "/feature-admin.png" }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`flex flex-col ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} items-center gap-8 sm:gap-14`}
                  >
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-lg sm:text-xl font-black shadow-xl shadow-primary/20">
                          0{i + 1}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                          <i className={`${step.icon} text-primary text-xl`} />
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                    </div>
                    <div className="flex-1 w-full">
                       <div className="relative glass p-3 sm:p-5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden group border-white/20 shadow-2xl interactive-hover">
                          <img src={step.img} alt={step.title} className="w-full h-auto rounded-xl sm:rounded-[2rem] group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <div className="rounded-full h-16 w-16 bg-white text-primary flex items-center justify-center shadow-2xl">
                                <i className={`${step.icon} text-2xl`} />
                             </div>
                          </div>
                          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 py-1.5 px-4 glass rounded-full border-white/20 shadow-xl text-xs font-black text-primary">
                             Step 0{i+1}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </section>

        {/* Final Interactive CTA */}
        <section className="py-16 sm:py-28 px-4 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 blur-[150px] rounded-full" />
          <motion.div 
            whileInView={{ scale: [0.95, 1] }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass p-8 sm:p-16 md:p-24 rounded-3xl sm:rounded-[4rem] text-center relative z-10 border-white/20 shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <i className="bi bi-rocket-takeoff text-[10rem] sm:text-[15rem] text-primary rotate-12" />
            </div>
            <div className="relative z-10 space-y-6 sm:space-y-10">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">
                The Future is <br /> <span className="text-primary flex items-center justify-center gap-3"><i className="bi bi-stars" /> Now.</span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-semibold leading-relaxed">
                Join a community of <span className="text-foreground font-black">500+</span> forward-thinking institutions elevating their standards today.
              </p>
              <div className="flex flex-row items-center justify-center gap-3 pt-2 flex-wrap">
                <Link href="/sign-up">
                  <Button size="sm" className="h-10 sm:h-12 px-5 sm:px-7 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/40 rounded-xl interactive-hover flex items-center gap-2">
                    <i className="bi bi-lightning" />
                    Join Ecosystem
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="sm" className="h-10 sm:h-12 px-5 sm:px-7 text-sm sm:text-base font-bold rounded-xl glass interactive-hover flex items-center gap-2">
                    <i className="bi bi-info-circle" />
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function RedirectHandler() {
  const router = useRouter();
  const { data: user, isLoading } = useGetMe();

  useEffect(() => {
    if (!isLoading && user) {
      const role = user.role;
      const isAdmin = role && ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(role);
      if (isAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative animate-spin rounded-full h-20 w-20 border-[8px] border-primary border-t-transparent shadow-2xl shadow-primary/40 flex items-center justify-center">
           <i className="bi bi-book-half text-2xl text-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Show when="signed-in">
        <RedirectHandler />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}
