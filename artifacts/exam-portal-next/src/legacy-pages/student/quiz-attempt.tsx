"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useGetQuiz, useStartExam, useSubmitExam, getGetQuizQueryKey, useGetMe } from "@workspace/api-client-react";
import { Clock, AlertTriangle, ChevronRight, CheckCircle2, ShieldCheck, Timer, AlertCircle, Info, ClipboardList, User as UserIcon, LogOut, ChevronLeft, Save, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentQuizAttempt({ quizId }: { quizId: number }) {
  const router = useRouter();
  const { data: user } = useGetMe();
  const { data: quiz, isLoading } = useGetQuiz(quizId, {
    query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) },
  });
  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0); // within section
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ attemptId: number; score: number; totalQuestions: number; correctAnswers: number; percentage: number } | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  const currentSection = quiz?.sections?.[currentSectionIdx];
  const totalSections = quiz?.sections?.length || 0;
  const currentQuestion = currentSection?.questions?.[currentQuestionIdx];

  useEffect(() => {
    if (currentQuestion && !visited.has(currentQuestion.id)) {
      setVisited(prev => new Set(prev).add(currentQuestion.id));
    }
  }, [currentQuestion, visited]);

  useEffect(() => {
    if (currentSection) {
      if (timeRemaining === 0) setTimeRemaining(currentSection.timeLimit);
    }
  }, [currentSectionIdx, currentSection]);

  useEffect(() => {
    if (!attemptId || timeRemaining <= 0 || submitted) {
      if (timeRemaining <= 0 && attemptId && !submitted) {
          toast.warning("Time's up for this section.");
          if (currentSectionIdx < totalSections - 1) {
            setCurrentSectionIdx(i => i + 1);
            setCurrentQuestionIdx(0);
          } else {
            handleSubmit();
          }
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, attemptId, submitted]);

  useEffect(() => {
    if (!attemptId || submitted) return;

    const preventAction = (event: Event) => event.preventDefault();
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((count) => {
            const nextCount = count + 1;
            if (nextCount < 3) {
                toast.error(`Warning: Tab switch detected! (${nextCount}/3)`, {
                    description: "Violation recorded. Continued attempts will result in auto-submission.",
                    duration: 5000,
                });
            }
            return nextCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("cut", preventAction);
    document.addEventListener("contextmenu", preventAction);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("cut", preventAction);
      document.removeEventListener("contextmenu", preventAction);
    };
  }, [attemptId, submitted]);

  useEffect(() => {
    if (tabSwitches >= 3 && attemptId && !submitted) {
      toast.error("Maximum violations reached. Security breach detected.");
      handleSubmit();
    }
  }, [tabSwitches, attemptId, submitted]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStart = () => {
    startExam.mutate({ data: { quizId } }, {
      onSuccess: (data) => {
        setAttemptId(data.id);
        toast.success("Secure Session Established.");
        document.documentElement.requestFullscreen?.().catch(() => undefined);
      },
    });
  };

  const handleSubmit = () => {
    if (!attemptId) return;
    const answerList = Object.entries(answers).map(([qId, opt]) => ({
      questionId: Number(qId),
      selectedOption: opt,
    }));

    submitExam.mutate({ data: { attemptId, answers: answerList, tabSwitches } }, {
      onSuccess: (data) => {
        setSubmitted(true);
        setResult(data);
        if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => undefined);
        }
      },
    });
  };

  const getQuestionStatus = (qId: number) => {
    if (answers[qId] !== undefined) return markedForReview.has(qId) ? "answered-marked" : "answered";
    if (markedForReview.has(qId)) return "marked";
    if (visited.has(qId)) return "visited";
    return "not-visited";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-emerald-500 border-emerald-500 text-white";
      case "answered-marked": return "bg-indigo-600 border-indigo-600 text-white relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-emerald-500 after:rounded-full after:border after:border-white";
      case "marked": return "bg-indigo-600 border-indigo-600 text-white";
      case "visited": return "bg-rose-500 border-rose-500 text-white";
      default: return "bg-white border-muted-foreground/30 text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "answered": return "bi bi-check-circle-fill text-emerald-500";
      case "marked": return "bi bi-bookmark-star-fill text-indigo-600";
      case "visited": return "bi bi-circle-fill text-rose-500";
      default: return "bi bi-circle text-muted-foreground/40";
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;

  if (submitted && result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10 p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden rounded-[3rem] bg-white">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="text-center pt-10">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-4">
                 <CheckCircle2 className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl font-black">Score Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8 p-10 pt-0">
               <div className="text-6xl font-black text-primary">{Math.round(result.percentage)}%</div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-2xl">
                     <p className="text-2xl font-black">{result.correctAnswers}</p>
                     <p className="text-[10px] font-black uppercase text-muted-foreground">Correct</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-2xl">
                     <p className="text-2xl font-black">{result.totalQuestions}</p>
                     <p className="text-[10px] font-black uppercase text-muted-foreground">Total</p>
                  </div>
               </div>
               <div className="space-y-3">
                 <Button onClick={() => router.push(`/student/review/${result.attemptId}`)} className="w-full h-12 rounded-2xl font-bold">View Detailed Performance</Button>
                 <Button variant="outline" onClick={() => router.push("/student/dashboard")} className="w-full h-12 rounded-2xl font-bold">Back to Dashboard</Button>
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <Card className="w-full max-w-xl border-none shadow-2xl rounded-[3rem] overflow-hidden">
           <CardHeader className="text-center pt-8 bg-muted/30">
              <CardTitle className="text-3xl font-black">{quiz?.title}</CardTitle>
              <p className="text-muted-foreground text-sm font-medium">Secure Assessment Portal</p>
           </CardHeader>
           <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between text-sm font-bold p-4 bg-primary/5 rounded-2xl text-primary">
                 <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> {totalSections} Subjects</div>
                 <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {Math.floor((quiz?.sections?.reduce((acc, s) => acc + s.timeLimit, 0) || 0) / 60)}m Total</div>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Sections</p>
                 {quiz?.sections?.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent">
                       <span className="text-sm font-bold">{i+1}. {s.title}</span>
                       <Badge variant="secondary" className="font-bold">{Math.floor(s.timeLimit / 60)}m</Badge>
                    </div>
                 ))}
              </div>
              <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                 <p className="text-sm font-black text-orange-800 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Security Protocol</p>
                 <ul className="text-[11px] text-orange-800/80 mt-2 space-y-1 list-disc pl-4 font-medium">
                    <li>The exam will run in <b>Focus Mode (Side-Navigation Hidden)</b>.</li>
                    <li>Tab violations will result in automatic submission.</li>
                    <li>Ensure a stable connection before proceeding.</li>
                 </ul>
              </div>
              <Button onClick={handleStart} className="w-full h-14 rounded-2xl font-black text-base shadow-xl group">
                 Launch Secure Interface <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] font-inter overflow-hidden">
      {/* PROFESSIONAL HEADER */}
      <header className="bg-white border-b border-border shadow-sm px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
           <div className="bg-primary text-white p-2 rounded-lg font-black text-sm tracking-tighter">LOGO</div>
           <div>
              <h1 className="text-base font-black tracking-tight text-slate-800">{quiz?.title}</h1>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">JEE Mains 2024 Portal</p>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Time Remaining</span>
              <div className={`flex items-center gap-2 font-mono text-xl font-black ${timeRemaining <= 300 ? "text-rose-500 animate-pulse" : "text-slate-700"}`}>
                 <Timer className="h-5 w-5" />
                 {formatTime(timeRemaining)}
              </div>
           </div>
           
           <div className="h-8 w-px bg-border" />
           
           <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"
                onClick={() => {
                    if (confirm("Exit quiz and return to dashboard? Your current progress will be lost if not submitted.")) {
                        router.push("/student/dashboard");
                    }
                }}
           >
                <CloseIcon className="h-5 w-5" />
           </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN PANEL (CENTER) */}
        <main className="flex-1 flex flex-col overflow-hidden">
           {/* SUBJECT TABS */}
           <div className="bg-white px-6 py-2 border-b flex items-center gap-1">
              {quiz?.sections?.map((s, idx) => (
                 <button
                    key={s.id}
                    onClick={() => {
                        setCurrentSectionIdx(idx);
                        setCurrentQuestionIdx(0);
                    }}
                    className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
                        currentSectionIdx === idx 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                 >
                    {s.title}
                 </button>
              ))}
              <div className="ml-auto flex items-center gap-4 pr-2 text-xs font-bold text-muted-foreground">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Secure Session
                 </div>
              </div>
           </div>

           {/* QUESTION AREA */}
           <div className="flex-1 overflow-y-auto p-8 relative bg-slate-50">
              <div className="max-w-4xl mx-auto">
                 <AnimatePresence mode="wait">
                    <motion.div 
                        key={`${currentSectionIdx}-${currentQuestionIdx}`}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                       <div className="flex items-start gap-6 pt-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-border font-black text-slate-400 shrink-0">
                             {currentQuestionIdx + 1}
                          </div>
                          <div className="space-y-6 flex-1">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Question Details</span>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] h-4">+4 / -1</Badge>
                             </div>
                             
                             <p className="text-xl font-bold text-slate-700 leading-relaxed">
                                {currentQuestion?.question}
                             </p>

                             {/* OPTIONS */}
                             <div className="pt-6">
                                <RadioGroup
                                    value={answers[currentQuestion?.id!] !== undefined ? String(answers[currentQuestion?.id!]) : ""}
                                    onValueChange={(v) => {
                                        const qId = currentQuestion?.id!;
                                        setAnswers(prev => ({ ...prev, [qId]: Number(v) }));
                                    }}
                                    className="grid gap-3"
                                >
                                    {currentQuestion?.options.map((opt, i) => {
                                        const isSelected = answers[currentQuestion?.id!] === i;
                                        return (
                                            <div key={i} className={`group relative rounded-2xl border-2 transition-all cursor-pointer ${
                                                isSelected ? "border-primary bg-primary/5 shadow-inner" : "border-white bg-white hover:border-primary/20 shadow-sm"
                                            }`}>
                                            <Label className="flex items-center gap-5 px-6 py-4 cursor-pointer w-full">
                                                <RadioGroupItem value={String(i)} id={`q-opt-${i}`} className="sr-only" />
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                                    isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10"
                                                }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className={`text-base font-bold transition-all ${isSelected ? "text-primary" : "text-slate-600"}`}>
                                                    {opt}
                                                </span>
                                            </Label>
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>

           {/* FOOTER ACTIONS */}
           <footer className="bg-white border-t border-border px-6 py-4 flex items-center justify-between">
              <div className="flex gap-3">
                 <Button 
                    variant="outline" 
                    className="rounded-xl font-black text-xs border-2 hover:bg-slate-50 text-slate-600"
                    onClick={() => {
                        const qId = currentQuestion?.id!;
                        setMarkedForReview(prev => {
                            const next = new Set(prev);
                            if (next.has(qId)) next.delete(qId);
                            else next.add(qId);
                            return next;
                        });
                    }}
                 >
                    <i className="bi bi-bookmark-star mr-2" /> Mark for Review
                 </Button>
                 <Button 
                    variant="ghost" 
                    className="rounded-xl font-black text-xs text-slate-400"
                    onClick={() => {
                        const qId = currentQuestion?.id!;
                        setAnswers(prev => {
                            const next = { ...prev };
                            delete next[qId];
                            return next;
                        });
                    }}
                 >
                    Clear Response
                 </Button>
              </div>

              <div className="flex gap-3">
                 <Button 
                    variant="outline"
                    className="rounded-xl font-black text-xs border-2 text-slate-400"
                    disabled={currentQuestionIdx === 0 && currentSectionIdx === 0}
                    onClick={() => {
                        if (currentQuestionIdx > 0) setCurrentQuestionIdx(prev => prev - 1);
                        else if (currentSectionIdx > 0) {
                            const prevSec = quiz?.sections?.[currentSectionIdx - 1];
                            setCurrentSectionIdx(prev => prev - 1);
                            setCurrentQuestionIdx((prevSec?.questions.length || 1) - 1);
                        }
                    }}
                 >
                    Back
                 </Button>
                 <Button 
                    className="rounded-xl font-black text-xs px-10 h-10 shadow-lg shadow-primary/20"
                    onClick={() => {
                        if (currentQuestionIdx < (currentSection?.questions.length || 0) - 1) {
                            setCurrentQuestionIdx(prev => prev + 1);
                        } else if (currentSectionIdx < totalSections - 1) {
                            setCurrentSectionIdx(prev => prev + 1);
                            setCurrentQuestionIdx(0);
                        } else {
                            handleSubmit();
                        }
                    }}
                 >
                    Save & Next <ChevronRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
           </footer>
        </main>

        {/* SIDEBAR PALETTE (RIGHT) - RESTORED FOR TIMINGS AND GRID */}
        <aside className="w-80 border-l bg-white flex flex-col overflow-hidden">
           {/* CANDIDATE PROFILE */}
           <div className="p-6 border-b bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <Avatar className="w-12 h-12 rounded-2xl border border-border shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Candidate"}`} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                 </Avatar>
                 <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-800 truncate">{user?.name || "Candidate Name"}</p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Roll No: 2024_{attemptId}</p>
                 </div>
              </div>

              {/* SECURITY HUB */}
              <div className="mt-6 p-3 bg-white rounded-xl border border-border shadow-sm space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase">System Status</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] h-3.5 px-1.5 uppercase">STABLE</Badge>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div initial={{ width: "100%" }} animate={{ width: "100%" }} className="h-full bg-emerald-500" />
                    </div>
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                 </div>
                 {tabSwitches > 0 && (
                    <div className="pt-1 flex items-center gap-2 text-rose-500 font-black text-[8px] uppercase tracking-tighter animate-bounce">
                       <AlertCircle className="h-3 w-3" /> Violations: {tabSwitches}/3
                    </div>
                 )}
              </div>
           </div>

           {/* LEGEND */}
           <div className="p-6 border-b">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                 {[
                    { label: "Answered", status: "answered" },
                    { label: "Not Answered", status: "visited" },
                    { label: "Marked", status: "marked" },
                    { label: "Not Visited", status: "not-visited" },
                 ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <i className={`${getStatusIcon(item.status)} text-xs`} />
                        <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* QUESTION PALETTE GRID */}
           <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Palette: {currentSection?.title}</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                 {currentSection?.questions.map((q, i) => {
                    const status = getQuestionStatus(q.id);
                    const isActive = currentQuestionIdx === i;
                    return (
                        <button
                            key={q.id}
                            onClick={() => setCurrentQuestionIdx(i)}
                            className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-black transition-all border-2 ${
                                getStatusColor(status)
                            } ${isActive ? "ring-2 ring-primary ring-offset-2 scale-110 z-10 shadow-lg" : "hover:brightness-95"}`}
                        >
                            {i + 1}
                        </button>
                    );
                 })}
              </div>
           </div>

           {/* SUBMIT SECTION */}
           <div className="p-6 border-t bg-slate-50">
              <Button 
                 className="w-full h-12 rounded-xl font-black text-xs shadow-lg shadow-primary/20"
                 onClick={() => {
                    if (confirm("Submit test? You cannot change your answers after this.")) {
                        handleSubmit();
                    }
                 }}
              >
                 Submit Test
              </Button>
           </div>
        </aside>
      </div>
    </div>
  );
}
