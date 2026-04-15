import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classes & Courses | ExamPlatform",
  description: "Explore class-wise quiz platforms and online exam modules available for various educational levels in India.",
};

const classGroups = [
  { name: "Class 6", icon: "bi-vector-pen" },
  { name: "Class 7", icon: "bi-palette2" },
  { name: "Class 8", icon: "bi-calculator" },
  { name: "Class 9", icon: "bi-microscope" },
  { name: "Class 10", icon: "bi-translate" },
  { name: "Class 11", icon: "bi-atom" },
  { name: "Class 12", icon: "bi-rocket-takeoff" }
];

export default function ClassesPublic() {
  return (
    <div className="min-h-screen bg-background pt-12">
      <main className="max-w-7xl mx-auto px-4 py-20 space-y-16">
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest">
             <i className="bi bi-journal-text" />
             Curriculum Coverage
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter">
            Class-wise <span className="text-primary italic">Quiz Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-bold leading-relaxed">
            Create chapters, assign content, and run <span className="text-foreground">free mock test India</span> practice flows for each class level.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {classGroups.map((cls) => (
            <Card key={cls.name} className="glass border-white/10 hover-elevate transition-all cursor-pointer group rounded-[2.5rem] p-6 interactive-hover overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-inner">
                   <i className={`bi ${cls.icon} text-3xl`} />
                </div>
                <CardTitle className="text-3xl font-black">{cls.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-muted-foreground font-bold leading-snug">
                  Chapters, quizzes, and tests ready to configure.
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                   Explore <i className="bi bi-arrow-right" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <section className="py-20 text-center">
           <div className="glass p-12 md:p-20 rounded-[4rem] border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 -z-10" />
              <div className="space-y-8 relative z-10">
                 <h2 className="text-3xl md:text-5xl font-black tracking-tight">Don't see your curriculum?</h2>
                 <p className="text-xl text-muted-foreground font-bold">We support custom board integration for ICSE, CBSE, and State Boards.</p>
                 <Button className="h-20 px-12 text-2xl font-black rounded-[2rem] shadow-xl shadow-primary/20 flex items-center gap-3 mx-auto interactive-hover">
                    <i className="bi bi-chat-left-dots" />
                    Contact Support
                 </Button>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
