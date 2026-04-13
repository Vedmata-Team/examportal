import StudentLayout from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Award, ClipboardList, TrendingUp, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" data-testid="text-student-dashboard-title">My Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card data-testid="card-student-attempts">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalAttempts ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-student-avg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(dashboard?.averageScore ?? 0)}%</p>
                    <p className="text-xs text-muted-foreground">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-student-completed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.completedQuizzes ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-student-available">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.availableQuizzes ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentScores || dashboard.recentScores.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-scores">No scores yet. Take a quiz to see your results here.</p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentScores.map((score, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-3" data-testid={`score-item-${idx}`}>
                    <div>
                      <p className="font-medium text-sm">{score.quizTitle}</p>
                      <p className="text-xs text-muted-foreground">{new Date(score.submittedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 w-48">
                      <Progress value={score.percentage} className="flex-1" />
                      <span className="text-sm font-medium w-12 text-right">{Math.round(score.percentage)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
