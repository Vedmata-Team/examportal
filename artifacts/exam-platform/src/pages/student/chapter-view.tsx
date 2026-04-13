import { useState, useEffect, useCallback } from "react";
import StudentLayout from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetChapter, getGetChapterQueryKey } from "@workspace/api-client-react";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const apiBase = `${import.meta.env.BASE_URL}api`;

export default function StudentChapterView({ chapterId }: { chapterId: number }) {
  const { data: chapter, isLoading } = useGetChapter(chapterId, {
    query: { enabled: !!chapterId, queryKey: getGetChapterQueryKey(chapterId) },
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [validatingRead, setValidatingRead] = useState(false);
  const [readError, setReadError] = useState("");

  const currentContent = chapter?.content?.[currentIndex];
  const totalContent = chapter?.content?.length || 0;

  useEffect(() => {
    if (currentContent) {
      setTimeRemaining(currentContent.minReadTime);
      setTimerStarted(true);
      setCanProceed(false);
      setReadError("");
      fetch(`${apiBase}/content/start-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contentId: currentContent.id }),
      }).catch(() => setReadError("Unable to start the secure reading timer. Please refresh and try again."));
    }
  }, [currentIndex, currentContent]);

  useEffect(() => {
    if (!timerStarted || timeRemaining <= 0) {
      if (timerStarted && timeRemaining <= 0 && currentContent && !canProceed && !validatingRead) {
        setValidatingRead(true);
        fetch(`${apiBase}/content/complete-reading`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ contentId: currentContent.id }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const data = await response.json().catch(() => null);
              throw new Error(data?.error || "Minimum reading time was not validated yet.");
            }
            setCanProceed(true);
          })
          .catch((error) => setReadError(error.message))
          .finally(() => setValidatingRead(false));
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, timeRemaining, currentContent, canProceed, validatingRead]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  if (isLoading) {
    return <StudentLayout><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-64" /><div className="h-64 bg-muted rounded" /></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-chapter-view-title">{chapter?.title}</h1>
          <p className="text-sm text-muted-foreground">{chapter?.className}</p>
        </div>

        {totalContent === 0 ? (
          <Card><CardContent className="pt-6 text-center text-muted-foreground">No content available for this chapter</CardContent></Card>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Progress value={((currentIndex + 1) / totalContent) * 100} className="flex-1" />
              <span className="text-sm text-muted-foreground">{currentIndex + 1} / {totalContent}</span>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Section {currentIndex + 1}</CardTitle>
                  <div className="flex items-center gap-2 text-sm" data-testid="text-timer">
                    <Clock className={`h-4 w-4 ${timeRemaining > 0 ? "text-destructive" : "text-green-600"}`} />
                    {timeRemaining > 0 ? (
                      <span className="font-mono text-destructive">{formatTime(timeRemaining)}</span>
                  ) : validatingRead ? (
                    <span className="text-primary font-medium">Validating...</span>
                    ) : (
                      <span className="text-green-600 font-medium">Ready</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentContent?.htmlContent || "" }}
                  data-testid="content-html"
                />
                {readError && (
                  <p className="mt-4 text-sm text-destructive" data-testid="text-reading-validation-error">{readError}</p>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}
                data-testid="button-prev-content"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />Previous
              </Button>
              <Button
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={!canProceed || currentIndex >= totalContent - 1}
                data-testid="button-next-content"
              >
                Next<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
