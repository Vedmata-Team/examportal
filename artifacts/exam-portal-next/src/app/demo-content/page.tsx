import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Content | ExamPlatform Preview",
  description: "Preview the student experience on ExamPlatform with our demo content, featuring timed reading and smart quiz interfaces.",
};

export default function DemoContent() {
  return (
    <div className="min-h-screen bg-background pt-12">
      <main className="max-w-5xl mx-auto px-4 py-20 md:py-32 space-y-12">
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest shadow-sm">
             <i className="bi bi-play-circle" />
             Live Experience
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter">
            Platform <span className="text-primary italic">Demo</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-bold leading-relaxed max-w-2xl mx-auto">
            Preview how timed reading and online exam system lessons are presented to students in real-time.
          </p>
        </section>

        <Card className="glass border-white/10 rounded-[3rem] shadow-2xl overflow-hidden interactive-hover">
          <CardHeader className="p-10 border-b border-white/10 bg-primary/5">
            <CardTitle className="text-3xl md:text-4xl font-black flex items-center gap-4 text-foreground">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                <i className="bi bi-file-earmark-text" />
              </div>
              Indian Constitution Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="prose prose-xl prose-orange max-w-none dark:prose-invert font-medium leading-relaxed text-muted-foreground">
              <p>
                Students read clean, focused content sections before moving to quiz practice. 
                Our platform features <span className="text-foreground font-bold underline decoration-primary/30">intelligent pacing</span>, ensuring maximum content retention.
              </p>
              <p>
                The interface can require a minimum reading time before unlocking the next section, preventing speed-skipping of critical material.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-primary/5 border-2 border-primary/20 rounded-[2rem] text-xl font-black text-primary shadow-inner">
              <div className="flex items-center gap-3">
                 <i className="bi bi-alarm text-3xl animate-pulse" />
                 Example minimum read time:
              </div>
              <span className="bg-primary text-white px-6 py-2 rounded-full shadow-lg">60 Seconds</span>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-6">
               <Button size="lg" className="h-20 px-12 text-2xl font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3 flex-1 lg:flex-none interactive-hover">
                  <i className="bi bi-check-circle" />
                  Unlock Quiz
               </Button>
               <Button variant="outline" size="lg" className="h-20 px-12 text-2xl font-black rounded-2xl glass flex items-center gap-3 flex-1 lg:flex-none interactive-hover">
                  <i className="bi bi-arrow-repeat" />
                  Reset View
               </Button>
            </div>
          </CardContent>
        </Card>

        <section className="text-center pt-10">
           <Link href="/sign-up">
              <div className="inline-flex items-center gap-3 text-lg font-black text-primary hover:gap-6 transition-all cursor-pointer">
                 Want the full experience? Create a free account <i className="bi bi-arrow-right" />
              </div>
           </Link>
        </section>
      </main>
    </div>
  );
}
