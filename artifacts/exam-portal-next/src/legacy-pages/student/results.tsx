"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useListExamAttempts } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function StudentResults() {
  const { data: attempts, isLoading } = useListExamAttempts();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = attempts?.filter((a) =>
    a.quizTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black tracking-tight text-foreground" data-testid="text-results-title">
            Performance History
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Review your scores and track your academic growth.</p>
        </div>
        <div className="relative w-full sm:w-60">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <Input
            placeholder="Filter results..."
            className="pl-9 h-9 bg-muted/50 border-border/50 rounded-xl text-xs focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table card */}
      <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded-xl" />
              ))}
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center">
                <i className="bi bi-trophy text-xl text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">No results yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Take a quiz to start building your record.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Assessment</TableHead>
                    <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Status</TableHead>
                    <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Score</TableHead>
                    <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Correct</TableHead>
                    <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Date</TableHead>
                    <TableHead className="px-5 py-3 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a, idx) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group border-b border-border/40 hover:bg-muted/20 transition-colors"
                      data-testid={`row-attempt-${a.id}`}
                    >
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <i className="bi bi-file-earmark-text-fill text-primary text-xs" />
                          </div>
                          <span className="font-bold text-xs text-foreground line-clamp-1 max-w-[160px]">{a.quizTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge variant="secondary" className={`font-black text-[9px] uppercase tracking-wide border-none px-2 py-0.5 ${
                          a.status === "SUBMITTED" ? "bg-emerald-500/10 text-emerald-600"
                          : a.status === "TIMED_OUT" ? "bg-red-500/10 text-red-600"
                          : "bg-yellow-500/10 text-yellow-600"
                        }`}>
                          {a.status === "SUBMITTED" ? <><i className="bi bi-check-circle-fill mr-1" />Done</> :
                           a.status === "TIMED_OUT" ? <><i className="bi bi-clock-fill mr-1" />Timed Out</> :
                           <><i className="bi bi-hourglass-split mr-1" />In Progress</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className={`text-sm font-black ${
                          (a.score ?? 0) >= 70 ? "text-emerald-500" :
                          (a.score ?? 0) >= 40 ? "text-orange-500" : "text-red-500"
                        }`}>
                          {a.score != null ? `${Math.round(a.score)}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-xs font-bold text-foreground">{a.correctAnswers ?? 0}</span>
                        <span className="text-[10px] text-muted-foreground"> / {a.totalQuestions}</span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <i className="bi bi-calendar3 text-xs" />
                          <span className="text-xs font-bold">{new Date(a.startedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right">
                        <Link href={`/student/review/${a.id}`}>
                          <Button size="sm" className="h-7 px-3 rounded-lg text-[10px] font-black shadow-sm shadow-primary/20">
                            Review <i className="bi bi-chevron-right ml-1 text-[10px]" />
                          </Button>
                        </Link>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
