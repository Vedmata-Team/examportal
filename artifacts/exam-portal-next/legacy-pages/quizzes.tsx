import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListQuizzes, useCreateQuiz, useListChapters, getListQuizzesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Settings } from "lucide-react";

const quizTypes = ["CHAPTER", "MOCK", "NATIONAL"] as const;

export default function AdminQuizzes() {
  const { data: quizzes } = useListQuizzes();
  const { data: chapters } = useListChapters();
  const createQuiz = useCreateQuiz();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [chapterIds, setChapterIds] = useState<number[]>([]);
  const [type, setType] = useState<string>("CHAPTER");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleCreate = () => {
    if (!title || (type !== "NATIONAL" && chapterIds.length === 0)) return;
    createQuiz.mutate({
      data: {
        title,
        chapterIds,
        type: type as any,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
        setOpen(false);
        setTitle("");
        setChapterIds([]);
        setType("CHAPTER");
        setStartTime("");
        setEndTime("");
      },
    });
  };

  const typeBadge = (t: string) => {
    switch (t) {
      case "NATIONAL": return "bg-red-100 text-red-800";
      case "MOCK": return "bg-blue-100 text-blue-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-quizzes-title">Manage Quizzes</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-quiz"><Plus className="h-4 w-4 mr-2" />Add Quiz</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Quiz</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Quiz Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1 Test" data-testid="input-quiz-title" /></div>
                {type !== "NATIONAL" && (
                  <div>
                    <Label>{type === "CHAPTER" ? "Chapter" : "Chapters"}</Label>
                    <div className="border rounded-md p-2 mt-1 max-h-[200px] overflow-y-auto space-y-1">
                      {chapters?.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-pointer" onClick={() => {
                          if (type === "CHAPTER") {
                            setChapterIds([c.id]);
                          } else {
                            setChapterIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
                          }
                        }}>
                          <input type="checkbox" checked={chapterIds.includes(c.id)} readOnly className="rounded border-gray-300 text-primary focus:ring-primary" />
                          <span className="text-sm">{c.title}</span>
                        </div>
                      ))}
                    </div>
                    {chapterIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chapterIds.map(id => {
                          const chapter = chapters?.find(c => c.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="text-[10px] py-0 h-5">
                              {chapter?.title}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger data-testid="select-quiz-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {quizTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {type === "NATIONAL" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        data-testid="input-quiz-start-time"
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        data-testid="input-quiz-end-time"
                      />
                    </div>
                  </div>
                )}
                <Button onClick={handleCreate} disabled={createQuiz.isPending} className="w-full" data-testid="button-submit-quiz">
                  {createQuiz.isPending ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Title</TableHead><TableHead>Chapter</TableHead><TableHead>Type</TableHead><TableHead>Questions</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {quizzes?.map((q) => (
                  <TableRow key={q.id} data-testid={`row-quiz-${q.id}`}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell>{q.chapterTitle}</TableCell>
                    <TableCell><Badge className={typeBadge(q.type)} variant="outline">{q.type}</Badge></TableCell>
                    <TableCell>{q.totalQuestions}</TableCell>
                    <TableCell>
                      <Link href={`/admin/quiz/${q.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-manage-quiz-${q.id}`}>
                          <Settings className="h-3 w-3 mr-1" />Manage
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {(!quizzes || quizzes.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No quizzes added yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
