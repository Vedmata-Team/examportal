import { Link } from "wouter";
import { BookOpen, Award, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground" data-testid="text-brand">ExamPlatform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline" data-testid="link-sign-in">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button data-testid="link-sign-up">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            India's Smart Exam & Learning Platform
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
            A comprehensive platform for educational institutions to manage hierarchical administration, deliver timed quizzes, and track student performance across the nation.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8" data-testid="button-cta">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" data-testid="text-features-title">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-feature-hierarchy">
              <CardContent className="pt-6 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Hierarchical Admin</h3>
                <p className="text-sm text-muted-foreground">Central, State, District, Institution level management</p>
              </CardContent>
            </Card>
            <Card data-testid="card-feature-quiz">
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Smart Quizzes</h3>
                <p className="text-sm text-muted-foreground">Section-wise timed quizzes with auto-submit</p>
              </CardContent>
            </Card>
            <Card data-testid="card-feature-security">
              <CardContent className="pt-6 text-center">
                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Secure Exams</h3>
                <p className="text-sm text-muted-foreground">Backend-validated timers and anti-cheat measures</p>
              </CardContent>
            </Card>
            <Card data-testid="card-feature-results">
              <CardContent className="pt-6 text-center">
                <Award className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">Real-time scoring and performance analytics</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          ExamPlatform - Online Exam System for Indian Education
        </div>
      </footer>
    </div>
  );
}
