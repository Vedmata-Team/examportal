import StudentLayout from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useListExamAttempts } from "@workspace/api-client-react";

export default function StudentResults() {
  const { data: attempts, isLoading } = useListExamAttempts();

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" data-testid="text-results-title">My Results</h1>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts?.map((a) => (
                    <TableRow key={a.id} data-testid={`row-attempt-${a.id}`}>
                      <TableCell className="font-medium">{a.quizTitle}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.status === "SUBMITTED" ? "bg-green-100 text-green-800"
                            : a.status === "TIMED_OUT" ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.score != null ? `${a.score}%` : "-"}</TableCell>
                      <TableCell>{a.correctAnswers != null ? `${a.correctAnswers}/${a.totalQuestions}` : `-/${a.totalQuestions}`}</TableCell>
                      <TableCell>{new Date(a.startedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!attempts || attempts.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No results yet. Take a quiz to see your scores here.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
