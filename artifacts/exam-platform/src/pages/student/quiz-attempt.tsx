import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useGetQuiz, useStartExam, useSubmitExam, getGetQuizQueryKey } from "@workspace/api-client-react";
import { Clock, AlertTriangle } from "lucide-react";

export default function StudentQuizAttempt({ quizId }: { quizId: number }) {
  const [, setLocation] = useLocation();
  const { data: quiz, isLoading } = useGetQuiz(quizId, {
    query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) },
  });
  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; totalQuestions: number; correctAnswers: number; percentage: number } | null>(null);

  const currentSection = quiz?.sections?.[currentSectionIdx];
  const totalSections = quiz?.sections?.length || 0;

  useEffect(() => {
    if (currentSection) {
      setTimeRemaining(currentSection.timeLimit);
    }
  }, [currentSectionIdx, currentSection]);

  useEffect(() => {
    if (!attemptId || timeRemaining <= 0 || submitted) {
      if (timeRemaining <= 0 && attemptId && !submitted && currentSectionIdx < totalSections - 1) {
        setCurrentSectionIdx((i) => i + 1);
      } else if (timeRemaining <= 0 && attemptId && !submitted && currentSectionIdx === totalSections - 1) {
        handleSubmit();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, attemptId, submitted]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStart = () => {
    startExam.mutate({ data: { quizId } }, {
      onSuccess: (data) => {
        setAttemptId(data.id);
      },
    });
  };

  const handleSubmit = () => {
    if (!attemptId) return;
    const answerList = Object.entries(answers).map(([qId, opt]) => ({
      questionId: Number(qId),
      selectedOption: opt,
    }));

    submitExam.mutate({ data: { attemptId, answers: answerList } }, {
      onSuccess: (data) => {
        setSubmitted(true);
        setResult(data);
      },
    });
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Complete</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary" data-testid="text-result-percentage">{Math.round(result.percentage)}%</div>
            <div className="text-sm text-muted-foreground">
              {result.correctAnswers} / {result.totalQuestions} correct
            </div>
            <Button onClick={() => setLocation("/student/results")} className="w-full" data-testid="button-view-results">
              View All Results
            </Button>
            <Button variant="outline" onClick={() => setLocation("/student/chapters")} className="w-full" data-testid="button-back-chapters">
              Back to Chapters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{quiz?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Sections: {totalSections}</p>
              {quiz?.sections?.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs border rounded px-3 py-2">
                  <span>{s.title}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.floor(s.timeLimit / 60)}m</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-3 bg-accent rounded text-xs text-accent-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Once started, you cannot pause. Timer will auto-submit when it expires. You cannot go back to previous sections.</span>
            </div>
            <Button onClick={handleStart} disabled={startExam.isPending} className="w-full" data-testid="button-start-exam">
              {startExam.isPending ? "Starting..." : "Start Exam"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">{quiz?.title}</h2>
          <p className="text-xs text-muted-foreground">{currentSection?.title} ({currentSectionIdx + 1}/{totalSections})</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 font-mono text-sm ${timeRemaining <= 30 ? "text-destructive" : ""}`} data-testid="text-quiz-timer">
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
          {currentSectionIdx === totalSections - 1 ? (
            <Button size="sm" onClick={handleSubmit} disabled={submitExam.isPending} data-testid="button-submit-exam">
              {submitExam.isPending ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button size="sm" onClick={() => setCurrentSectionIdx((i) => i + 1)} data-testid="button-next-section">
              Next Section
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {currentSection?.questions.map((q, idx) => (
          <Card key={q.id} data-testid={`card-question-${q.id}`}>
            <CardContent className="pt-6">
              <p className="font-medium mb-4">Q{idx + 1}. {q.question}</p>
              <RadioGroup
                value={answers[q.id] !== undefined ? String(answers[q.id]) : ""}
                onValueChange={(v) => handleAnswer(q.id, Number(v))}
              >
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 rounded hover:bg-accent">
                    <RadioGroupItem value={String(i)} id={`q${q.id}-opt${i}`} data-testid={`radio-q${q.id}-opt${i}`} />
                    <Label htmlFor={`q${q.id}-opt${i}`} className="cursor-pointer flex-1">
                      {String.fromCharCode(65 + i)}. {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
