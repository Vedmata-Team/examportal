"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListChapters, useListClasses, useListQuizzes } from "@workspace/api-client-react";
import { BookOpen, ClipboardList, Filter, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export default function StudentChapters() {
  const [filterClassId, setFilterClassId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: chapters, isLoading: loadingChapters } = useListChapters(filterClassId && filterClassId !== "all" ? { classId: Number(filterClassId) } : undefined);
  const { data: classes } = useListClasses();
  const { data: quizzes } = useListQuizzes();

  const getQuizzesForChapter = (chapterId: number) => {
    return quizzes?.filter((q) => q.chapterId === chapterId) || [];
  };

  const filteredChapters = chapters?.filter(ch => 
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ch.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            variants={itemVariants} 
            className="text-lg font-black tracking-tight text-foreground" 
            data-testid="text-student-chapters-title"
          >
            Learning Chapters
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xs text-muted-foreground mt-0.5">
            Explore subjects, read chapters, and challenge yourself with quizzes.
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-56">
             <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
             <Input 
                placeholder="Search chapters..." 
                className="pl-9 h-9 bg-muted/50 border-border/50 rounded-xl focus-visible:ring-primary text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-primary/10 p-2 rounded-xl text-primary flex items-center justify-center shrink-0">
               <i className="bi bi-funnel-fill text-sm" />
            </div>
            <Select value={filterClassId} onValueChange={setFilterClassId}>
              <SelectTrigger className="w-full sm:w-40 h-9 bg-muted/50 border-border/50 rounded-xl text-xs" data-testid="select-student-filter-class">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!filteredChapters || filteredChapters.length === 0 ? (
                <div className="w-full py-20">
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
              <i className="bi bi-journal-x text-2xl text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No chapters found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          </div>
        </div>
        ) : (
          <motion.div 
            key="grid"
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredChapters.map((ch) => {
              const chapterQuizzes = getQuizzesForChapter(ch.id);
              return (
                <motion.div key={ch.id} variants={itemVariants}>
                  <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group rounded-[2rem] overflow-hidden bg-card" data-testid={`card-chapter-${ch.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                           <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest rounded-lg">
                             {ch.className}
                           </Badge>
                           <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                             {ch.title}
                           </CardTitle>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                           <i className="bi bi-journal-bookmark-fill text-base" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="pt-2">
                        <Link href={`/student/chapter/${ch.id}`}>
                          <Button className="w-full bg-muted/50 hover:bg-primary hover:text-white text-foreground border-none rounded-xl h-10 font-black shadow-none transition-all group/btn text-xs" data-testid={`button-read-${ch.id}`}>
                            <i className="bi bi-book-half text-sm mr-2" />
                            Read Content
                            <i className="bi bi-arrow-right text-xs ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                          </Button>
                        </Link>
                      </div>

                      {chapterQuizzes.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                             <i className="bi bi-clipboard2-check-fill text-primary text-xs" /> Practice Assessments
                          </p>
                          <div className="grid gap-2">
                            {chapterQuizzes.map((q) => (
                              <Link key={q.id} href={`/student/quiz/${q.id}`}>
                                  <motion.div 
                                  whileHover={{ x: 4 }}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 cursor-pointer transition-all" 
                                  data-testid={`link-quiz-${q.id}`}
                                >
                                  <span className="text-xs font-bold text-foreground truncate">{q.title}</span>
                                  <i className="bi bi-chevron-right text-primary text-xs shrink-0 ml-2" />
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
