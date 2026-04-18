"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle, Clock, ShieldAlert, Award, ChevronRight, FileText, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export default function StudentReview({ id: propId }: { id?: string }) {
  const wouterParams = useParams() || {};
  const id = propId || wouterParams.id;
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!attempt || attempt.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Failed to load result</h2>
            <p className="text-muted-foreground font-medium">This attempt might not exist or you don't have access.</p>
        </div>
        <Button onClick={() => router.push("/student/results")} className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-primary/20">
            Back to Results
        </Button>
      </div>
    );
  }

  const durationMinutes = Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-muted/20 pb-20"
    >
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/student/results")} className="rounded-xl hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-black text-lg tracking-tight line-clamp-1">{attempt.quizTitle}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5">Detailed Review</Badge>
                  <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="text-2xl font-black text-primary leading-none tracking-tighter">{attempt.score}%</div>
             <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Overall Grade</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-10 mt-4">
        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Final Score", value: `${attempt.score}%`, icon: Award, color: "text-primary", bg: "bg-primary/10" },
            { label: "Accuracy", value: `${attempt.correctAnswers} / ${attempt.totalQuestions}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Duration", value: `${durationMinutes}m`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Tab Switches", value: attempt.tabSwitches, icon: ShieldAlert, color: attempt.tabSwitches > 0 ? "text-destructive" : "text-muted-foreground", bg: attempt.tabSwitches > 0 ? "bg-destructive/10" : "bg-muted/50" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-1`}>
                        <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-foreground tracking-tight">{stat.value}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
            </motion.div>
          ))}
        </div>

        {/* Question Analysis */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Question-by-Question Analysis
            </h2>
            <Badge className="bg-muted text-muted-foreground border-none font-bold">{attempt.answers.length} Total</Badge>
          </motion.div>

          {attempt.answers.map((answer: any, idx: number) => (
            <motion.div key={answer.id} variants={itemVariants}>
                <Card className={`border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white transition-all duration-300 ${answer.isCorrect ? "border-l-8 border-emerald-500" : "border-l-8 border-destructive"}`}>
                <CardHeader className="pb-4 pt-10 px-8 sm:px-10">
                    <div className="flex items-start justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Question {idx + 1}</span>
                           {answer.isCorrect ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase px-2 h-4">Correct</Badge>
                           ) : (
                                <Badge className="bg-destructive/10 text-destructive border-none font-black text-[8px] uppercase px-2 h-4">Incorrect</Badge>
                           )}
                        </div>
                        <CardTitle className="text-xl font-bold leading-tight text-foreground">{answer.question.question}</CardTitle>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${answer.isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                        {answer.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 px-8 sm:px-10 pb-10">
                    <div className="grid gap-2">
                    {answer.question.options.map((opt: string, i: number) => {
                        const isUserChoice = answer.selectedOption === i;
                        const isCorrect = answer.question.correctAnswer === i;
                        
                        let stateStyles = "bg-muted/30 border-transparent text-muted-foreground";
                        if (isCorrect) stateStyles = "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 font-bold shadow-sm";
                        if (isUserChoice && !isCorrect) stateStyles = "bg-destructive/5 border-destructive/20 text-destructive font-bold";

                        return (
                        <div 
                            key={i} 
                            className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${stateStyles}`}
                        >
                            <span className="flex items-center gap-4 text-sm">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                    isCorrect ? "bg-emerald-500 text-white" : 
                                    isUserChoice ? "bg-destructive text-white" : "bg-white/50 text-muted-foreground"
                                }`}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                            </span>
                            <div className="flex items-center gap-2">
                                {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                {isUserChoice && (
                                    <Badge variant={isCorrect ? "default" : "destructive"} className="font-black text-[8px] uppercase border-none px-2 h-4">
                                        Your Answer
                                    </Badge>
                                )}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                    
                    {!answer.isCorrect && (
                         <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 border-dashed flex items-start gap-3">
                             <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                             <p className="text-xs font-semibold text-primary/80">
                                Feedback Analysis: You selected <b>{answer.question.options[answer.selectedOption]}</b>, but the correct answer is <b>{answer.question.options[answer.question.correctAnswer]}</b>.
                             </p>
                         </div>
                    )}
                </CardContent>
                </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="flex justify-center pt-6">
            <Button onClick={() => router.push("/student/results")} variant="outline" className="h-12 px-10 rounded-2xl font-black text-sm border-2 hover:bg-white shadow-xl shadow-muted transition-all flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back to All Results
            </Button>
        </motion.div>
      </main>
    </motion.div>
  );
}

