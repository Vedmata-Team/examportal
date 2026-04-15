import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoContent() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Demo Content | ExamPlatform Preview</title>
        <meta name="description" content="Preview the student experience on ExamPlatform with our demo content, featuring timed reading and smart quiz interfaces." />
      </Helmet>
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><span className="text-xl font-bold cursor-pointer">ExamPlatform</span></Link>
          <Link href="/sign-up"><Button>Try Demo</Button></Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-14 space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Demo Content</h1>
          <p className="text-muted-foreground">Preview how timed reading and online exam system lessons are presented to students.</p>
        </section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Sample Chapter: Indian Constitution Basics</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Students read clean, focused content sections before moving to quiz practice. The platform can require a minimum reading time before unlocking the next section.</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Example minimum read time: 60 seconds</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}