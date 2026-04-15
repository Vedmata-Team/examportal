import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGetQuiz, useCreateQuizSection, useCreateQuestion, getGetQuizQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Clock } from "lucide-react";

export default function AdminQuizDetail({ quizId }: { quizId: number }) {
  const { data: quiz, isLoading } = useGetQuiz(quizId, {
    query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) },
  });
  const createSection = useCreateQuizSection();
  const createQuestion = useCreateQuestion();
  const queryClient = useQueryClient();

  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("300");
  const [sectionOrder, setSectionOrder] = useState("0");

  const [questionOpen, setQuestionOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(0);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [questionOrder, setQuestionOrder] = useState("0");

  const handleAddSection = () => {
    if (!sectionTitle) return;
    createSection.mutate({
      data: { quizId, title: sectionTitle, timeLimit: Number(timeLimit), orderIndex: Number(sectionOrder) },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetQuizQueryKey(quizId) });
        setSectionOpen(false);
        setSectionTitle("");
        setTimeLimit("300");
        setSectionOrder("0");
      },
    });
  };

  const handleAddQuestion = () => {
    if (!questionText || !selectedSectionId) return;
    createQuestion.mutate({
      data: {
        sectionId: selectedSectionId,
        question: questionText,
        options: options.filter((o) => o.trim()),
        correctAnswer: Number(correctAnswer),
        orderIndex: Number(questionOrder),
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetQuizQueryKey(quizId) });
        setQuestionOpen(false);
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("0");
        setQuestionOrder("0");
      },
    });
  };

  if (isLoading) {
    return <><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-64" /><div className="h-40 bg-muted rounded" /></div></>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-quiz-detail-title">{quiz?.title}</h1>
            <p className="text-sm text-muted-foreground">Type: {quiz?.type}</p>
          </div>
          <Dialog open={sectionOpen} onOpenChange={setSectionOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-section"><Plus className="h-4 w-4 mr-2" />Add Section</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Quiz Section</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Section Title</Label><Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="e.g. Section A" data-testid="input-section-title" /></div>
                <div><Label>Time Limit (seconds)</Label><Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} data-testid="input-time-limit" /></div>
                <div><Label>Order</Label><Input type="number" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)} data-testid="input-section-order" /></div>
                <Button onClick={handleAddSection} disabled={createSection.isPending} className="w-full" data-testid="button-submit-section">
                  {createSection.isPending ? "Creating..." : "Add Section"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {quiz?.sections && quiz.sections.length > 0 ? (
          quiz.sections.map((section) => (
            <Card key={section.id} data-testid={`card-section-${section.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {section.title}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{Math.floor(section.timeLimit / 60)}m {section.timeLimit % 60}s
                    </span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedSectionId(section.id); setQuestionOpen(true); }}
                    data-testid={`button-add-question-${section.id}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {section.questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No questions yet</p>
                ) : (
                  <div className="space-y-3">
                    {section.questions.map((q, idx) => (
                      <div key={q.id} className="border rounded-lg p-3" data-testid={`question-${q.id}`}>
                        <p className="font-medium text-sm mb-2">Q{idx + 1}. {q.question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`text-xs px-2 py-1 rounded ${i === q.correctAnswer ? "bg-green-100 text-green-800 font-medium" : "bg-muted"}`}
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No sections yet. Add a section to start building the quiz.
            </CardContent>
          </Card>
        )}

        <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Question</Label><Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter question" data-testid="input-question-text" /></div>
              {options.map((opt, i) => (
                <div key={i}>
                  <Label>Option {String.fromCharCode(65 + i)}</Label>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    data-testid={`input-option-${i}`}
                  />
                </div>
              ))}
              <div><Label>Correct Answer (0-3)</Label><Input type="number" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} data-testid="input-correct-answer" /></div>
              <Button onClick={handleAddQuestion} disabled={createQuestion.isPending} className="w-full" data-testid="button-submit-question">
                {createQuestion.isPending ? "Creating..." : "Add Question"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
