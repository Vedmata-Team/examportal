import React from "react";
import Link from "next/link";
import { BookOpen, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><span className="text-xl font-bold cursor-pointer">ExamPlatform</span></Link>
          <Link href="/sign-up"><Button>Get Started</Button></Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-14 space-y-10">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">About Our Online Exam System</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            ExamPlatform helps education bodies, districts, institutions, and students run secure class-wise quiz programs, timed reading lessons, mock tests, and national tests from one responsive dashboard.
          </p>
        </section>
        <div className="grid md:grid-cols-3 gap-6">
          <Card><CardHeader><Users className="h-8 w-8 text-primary" /><CardTitle>Hierarchical Admin</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Central, state, district, and institution roles keep data access organized and controlled.</CardContent></Card>
          <Card><CardHeader><BookOpen className="h-8 w-8 text-primary" /><CardTitle>Student Learning</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Students access chapters, timed content, practice quizzes, mock tests, and results in a clean portal.</CardContent></Card>
          <Card><CardHeader><Shield className="h-8 w-8 text-primary" /><CardTitle>Secure Exams</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Protected routes, server-side validation, timers, and anti-cheat checks reduce loopholes.</CardContent></Card>
        </div>
      </main>
    </div>
  );
}
