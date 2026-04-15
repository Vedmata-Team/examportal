import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Award, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>ExamPlatform | India's Smart Exam & Learning System</title>
        <meta name="description" content="A comprehensive platform for educational institutions to manage hierarchical administration, deliver timed quizzes, and track student performance across the nation. Free mock tests and class-wise quizzes available." />
        <meta name="keywords" content="online exam system, mock test india, class-wise quiz platform, exam portal, institutional management" />
      </Helmet>
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground" data-testid="text-brand">ExamPlatform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/about">
              <Button variant="ghost" data-testid="link-about">About</Button>
            </Link>
            <Link href="/classes">
              <Button variant="ghost" data-testid="link-classes">Classes</Button>
            </Link>
            <Link href="/demo-content">
              <Button variant="ghost" data-testid="link-demo-content">Demo</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" data-testid="link-sign-in">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button data-testid="link-sign-up">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary rounded-full mb-6">
              New: Live National Tests Scheduled for 2026
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]" data-testid="text-hero-title">
              India's Most <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-400">Advanced</span> Exam Platform
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-testid="text-hero-description"
          >
            Empowering institutions with hierarchical management, secure high-stakes exams, and data-driven student performance analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold shadow-lg shadow-primary/20" data-testid="button-cta">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/demo-content">
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-semibold" data-testid="button-demo">
                Explore Demo
              </Button>
            </Link>
          </motion.div>
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
