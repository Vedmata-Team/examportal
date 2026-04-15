import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const classGroups = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

export default function ClassesPublic() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Classes & Courses | ExamPlatform</title>
        <meta name="description" content="Explore class-wise quiz platforms and online exam modules available for various educational levels in India." />
      </Helmet>
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><span className="text-xl font-bold cursor-pointer">ExamPlatform</span></Link>
          <Link href="/sign-in"><Button variant="outline">Sign In</Button></Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-14 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Class-wise Quiz Platform</h1>
          <p className="text-muted-foreground max-w-2xl">Create chapters, assign content, and run free mock test India practice flows for each class.</p>
        </section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classGroups.map((name) => (
            <Card key={name}>
              <CardHeader><BookOpen className="h-7 w-7 text-primary" /><CardTitle>{name}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Chapters, quizzes, and tests ready to configure.</CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}