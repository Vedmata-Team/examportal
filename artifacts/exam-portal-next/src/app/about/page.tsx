import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ExamPlatform - India's Online Exam Solution",
  description: "Learn more about ExamPlatform, a secure and hierarchical online examination system designed for the Indian education ecosystem, from central administration to student learning.",
};

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-14 sm:py-24 space-y-12 sm:space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest shadow-sm">
             <i className="bi bi-info-circle" />
             The Mission
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter">
            About Our <span className="text-primary italic">Online Exam System</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            ExamPlatform helps education bodies, districts, institutions, and students run secure class-wise quiz programs, timed reading lessons, mock tests, and national tests from one responsive dashboard.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
          {[
            {
              title: "Hierarchical Admin",
              icon: "bi bi-layers",
              desc: "Central, state, district, and institution roles keep data access organized and controlled.",
              color: "text-blue-500 bg-blue-500/10"
            },
            {
              title: "Student Learning",
              icon: "bi bi-mortarboard",
              desc: "Students access chapters, timed content, practice quizzes, mock tests, and results in a clean portal.",
              color: "text-primary bg-primary/10"
            },
            {
              title: "Secure Exams",
              icon: "bi bi-shield-lock",
              desc: "Protected routes, server-side validation, timers, and anti-cheat checks reduce loopholes.",
              color: "text-emerald-500 bg-emerald-500/10"
            }
          ].map((item, i) => (
            <Card key={i} className="hover-elevate transition-all border-white/10 glass rounded-2xl sm:rounded-[2rem] p-3 flex flex-col items-center text-center interactive-hover">
              <CardHeader className="items-center pb-2">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center mb-2 shadow-xl ${item.color}`}>
                   <i className={`${item.icon} text-2xl sm:text-3xl`} />
                </div>
                <CardTitle className="text-lg sm:text-2xl font-black tracking-tight">
                   {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed px-3 pb-5">
                {item.desc}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="bg-primary p-8 sm:p-14 md:p-20 rounded-2xl sm:rounded-[3rem] text-primary-foreground text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <i className="bi bi-gear text-[10rem] animate-spin-slow" />
           </div>
           <div className="relative z-10 space-y-5">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">Ready to see it in <span className="italic underline underline-offset-8">Action?</span></h2>
              <div className="flex flex-row items-center justify-center gap-3 flex-wrap">
                <Link href="/sign-up">
                  <Button size="sm" className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-black bg-white text-primary hover:bg-white/90 rounded-xl shadow-2xl">
                    Get Started
                  </Button>
                </Link>
                <Link href="/demo-content">
                  <Button variant="outline" size="sm" className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-black border-white/20 text-white hover:bg-white/10 rounded-xl">
                    Watch Demo
                  </Button>
                </Link>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
