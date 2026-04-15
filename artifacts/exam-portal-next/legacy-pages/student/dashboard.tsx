import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Award, ClipboardList, TrendingUp, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  const chartData = dashboard?.recentScores?.map((s) => ({
    name: new Date(s.submittedAt).toLocaleDateString(),
    score: Math.round(s.percentage),
  })).reverse() ?? [];

  return (
    <>
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

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full pt-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                    Not enough data to show trend
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {!dashboard?.recentScores || dashboard.recentScores.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="text-no-scores">No scores yet. Take a quiz to see your results here.</p>
              ) : (
                <div className="space-y-4">
                  {dashboard.recentScores.slice(0, 5).map((score, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-3" data-testid={`score-item-${idx}`}>
                      <div className="min-w-0">
                        <p className="font-medium text-xs truncate">{score.quizTitle}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(score.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{Math.round(score.percentage)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>

  );
}
