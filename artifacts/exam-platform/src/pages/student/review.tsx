import { useGetMe } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function StudentReview() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/exams/attempts/${id}`)
      .then(res => res.json())
      .then(data => {
        setAttempt(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!attempt || attempt.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Failed to load attempt</h2>
        <Button onClick={() => setLocation("/student/results")}>Back to Results</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b px-4 py-4 backdrop-blur-md bg-card/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/student/results")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">{attempt.quizTitle}</h1>
              <p className="text-xs text-muted-foreground">Detailed Review • {new Date(attempt.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Badge className="text-lg py-1 px-4">{attempt.score}%</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{attempt.score}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Final Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{attempt.correctAnswers} / {attempt.totalQuestions}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Correct</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)}m</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Time Taken</div>
            </CardContent>
          </Card>
          <Card className={attempt.tabSwitches > 0 ? "border-destructive/30" : ""}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{attempt.tabSwitches}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Tab Switches</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 px-2">
            Question Analysis
          </h2>
          {attempt.answers.map((answer: any, idx: number) => (
            <Card key={answer.id} className={answer.isCorrect ? "border-green-200 bg-green-50/10" : "border-red-200 bg-red-50/10 shadow-sm"}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Question {idx + 1}</span>
                    <CardTitle className="text-base leading-relaxed">{answer.question.question}</CardTitle>
                  </div>
                  {answer.isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {answer.question.options.map((opt: string, i: number) => {
                    const isUserChoice = answer.selectedOption === i;
                    const isCorrect = answer.question.correctAnswer === i;
                    
                    let bgClass = "bg-muted/30 border-transparent text-muted-foreground";
                    if (isCorrect) bgClass = "bg-green-100 border-green-300 text-green-800 font-medium";
                    if (isUserChoice && !isCorrect) bgClass = "bg-red-100 border-red-300 text-red-800 font-medium";

                    return (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg border text-sm flex items-center justify-between ${bgClass}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="opacity-50 font-mono">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </span>
                        {isUserChoice && <Badge variant={isCorrect ? "default" : "destructive"} className="text-[10px] h-4">Your Answer</Badge>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
