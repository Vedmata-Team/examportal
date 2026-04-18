"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGetChapter, getGetChapterQueryKey } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentChapterView({ chapterId }: { chapterId: number }) {
  const router = useRouter();
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
  const progress = totalContent > 0 ? ((currentIndex + 1) / totalContent) * 100 : 0;

  useEffect(() => {
    if (currentContent) {
      setTimeRemaining(currentContent.minReadTime);
      setTimerStarted(true);
      setCanProceed(false);
      setReadError("");
      fetch(`/api/content/start-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contentId: currentContent.id }),
      }).catch(() => {});
    }
  }, [currentIndex, currentContent]);

  useEffect(() => {
    if (!timerStarted || timeRemaining <= 0) {
      if (timerStarted && timeRemaining <= 0 && currentContent && !canProceed && !validatingRead) {
        setValidatingRead(true);
        fetch(`/api/content/complete-reading`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ contentId: currentContent.id }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const d = await res.json().catch(() => null);
              throw new Error(d?.error || "Reading time not validated.");
            }
            setCanProceed(true);
          })
          .catch((e) => setReadError(e.message))
          .finally(() => setValidatingRead(false));
      }
      return;
    }
    const interval = setInterval(() => setTimeRemaining((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timerStarted, timeRemaining, currentContent, canProceed, validatingRead]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-48" />
        <div className="h-2 bg-muted rounded w-full" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!chapter || totalContent === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <i className="bi bi-journal-x text-2xl text-muted-foreground/40" />
        </div>
        <p className="text-sm font-bold text-muted-foreground">No content available for this chapter.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl">
          <i className="bi bi-arrow-left mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-5 pb-10"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <i className="bi bi-arrow-left text-sm" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{chapter.className}</span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-foreground" data-testid="text-chapter-view-title">
            {chapter.title}
          </h1>
        </div>

        {/* Timer pill */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
          timeRemaining > 0
            ? "bg-orange-500/10 text-orange-600"
            : validatingRead
            ? "bg-blue-500/10 text-blue-600"
            : "bg-emerald-500/10 text-emerald-600"
        }`} data-testid="text-timer">
          <i className={`bi ${timeRemaining > 0 ? "bi-hourglass-split animate-pulse" : validatingRead ? "bi-arrow-repeat" : "bi-check-circle-fill"} text-sm`} />
          {timeRemaining > 0 ? formatTime(timeRemaining) : validatingRead ? "Validating..." : "Ready"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Section {currentIndex + 1} of {totalContent}
          </span>
          <span className="text-[10px] font-black text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Section dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalContent }).map((_, i) => (
          <button
            key={i}
            onClick={() => i < currentIndex && setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-6 bg-primary" :
              i < currentIndex ? "w-3 bg-primary/40 cursor-pointer hover:bg-primary/60" :
              "w-3 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Content card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <i className="bi bi-file-text-fill text-primary text-xs" />
              </div>
              <span className="text-xs font-black text-foreground">Section {currentIndex + 1}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <i className="bi bi-clock text-blue-500" />
                {Math.ceil((currentContent?.minReadTime || 0) / 60)} min read
              </span>
            </div>
          </div>

          {/* Content body */}
          <div className="p-5 sm:p-7">
            <div
              className="prose prose-sm max-w-none text-foreground
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
                prose-h2:text-base prose-h3:text-sm
                prose-p:text-sm prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-li:text-sm prose-li:text-muted-foreground
                prose-strong:text-foreground prose-strong:font-bold
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic
                prose-ul:space-y-1"
              dangerouslySetInnerHTML={{ __html: currentContent?.htmlContent || "" }}
              data-testid="content-html"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {readError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-xs font-bold"
          data-testid="text-reading-validation-error"
        >
          <i className="bi bi-exclamation-triangle-fill text-sm shrink-0" />
          {readError}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setCurrentIndex((i) => i - 1); setCanProceed(false); }}
          disabled={currentIndex === 0}
          className="rounded-xl h-9 px-4 font-bold text-xs border-border/60"
          data-testid="button-prev-content"
        >
          <i className="bi bi-arrow-left mr-1.5" /> Previous
        </Button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalContent }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? "bg-primary scale-125" : i < currentIndex ? "bg-primary/30" : "bg-muted"}`} />
          ))}
        </div>

        {currentIndex < totalContent - 1 ? (
          <Button
            size="sm"
            onClick={() => { setCurrentIndex((i) => i + 1); setCanProceed(false); }}
            disabled={!canProceed}
            className="rounded-xl h-9 px-4 font-bold text-xs shadow-sm shadow-primary/20"
            data-testid="button-next-content"
          >
            Next <i className="bi bi-arrow-right ml-1.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => router.back()}
            disabled={!canProceed}
            className="rounded-xl h-9 px-4 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20"
            data-testid="button-finish-content"
          >
            <i className="bi bi-check-circle-fill mr-1.5" /> Finish
          </Button>
        )}
      </div>
    </motion.div>
  );
}
