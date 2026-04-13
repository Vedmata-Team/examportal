import { useState } from "react";
import { Link } from "wouter";
import StudentLayout from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListChapters, useListClasses, useListQuizzes } from "@workspace/api-client-react";
import { BookOpen, ClipboardList } from "lucide-react";

export default function StudentChapters() {
  const [filterClassId, setFilterClassId] = useState<string>("");
  const { data: chapters } = useListChapters(filterClassId ? { classId: Number(filterClassId) } : undefined);
  const { data: classes } = useListClasses();
  const { data: quizzes } = useListQuizzes();

  const getQuizzesForChapter = (chapterId: number) => {
    return quizzes?.filter((q) => q.chapterId === chapterId) || [];
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-student-chapters-title">Chapters</h1>
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="w-48" data-testid="select-student-filter-class"><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {!chapters || chapters.length === 0 ? (
          <Card><CardContent className="pt-6 text-center text-muted-foreground">No chapters available yet</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch) => {
              const chapterQuizzes = getQuizzesForChapter(ch.id);
              return (
                <Card key={ch.id} data-testid={`card-chapter-${ch.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{ch.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">{ch.className}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Link href={`/student/chapter/${ch.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-read-${ch.id}`}>
                          <BookOpen className="h-3 w-3 mr-1" />Read
                        </Button>
                      </Link>
                    </div>
                    {chapterQuizzes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Available Quizzes:</p>
                        {chapterQuizzes.map((q) => (
                          <Link key={q.id} href={`/student/quiz/${q.id}`}>
                            <div className="flex items-center justify-between p-2 rounded border hover:bg-accent cursor-pointer" data-testid={`link-quiz-${q.id}`}>
                              <span className="text-sm">{q.title}</span>
                              <ClipboardList className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
