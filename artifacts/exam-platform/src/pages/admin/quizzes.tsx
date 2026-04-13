import { useState } from "react";
import { Link } from "wouter";
import AdminLayout from "@/components/admin-layout";
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
  const [chapterId, setChapterId] = useState("");
  const [type, setType] = useState<string>("CHAPTER");

  const handleCreate = () => {
    if (!title || !chapterId) return;
    createQuiz.mutate({ data: { title, chapterId: Number(chapterId), type: type as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
        setOpen(false);
        setTitle("");
        setChapterId("");
        setType("CHAPTER");
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
    <AdminLayout>
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
                <div>
                  <Label>Chapter</Label>
                  <Select value={chapterId} onValueChange={setChapterId}>
                    <SelectTrigger data-testid="select-quiz-chapter"><SelectValue placeholder="Select chapter" /></SelectTrigger>
                    <SelectContent>
                      {chapters?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger data-testid="select-quiz-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {quizTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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
    </AdminLayout>
  );
}
