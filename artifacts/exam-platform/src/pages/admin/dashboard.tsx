import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminDashboard, useGetRecentActivity } from "@workspace/api-client-react";
import { Users, School, ClipboardList, MapPin, Building, BookOpen, Award, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const { data: activity } = useGetRecentActivity();

  // Mock data for distribution since backend doesn't provide it yet
  const distributionData = [
    { range: '0-20%', count: 12, fill: '#ff4d4d' },
    { range: '21-40%', count: 18, fill: '#ffa64d' },
    { range: '41-60%', count: 45, fill: '#ffff4d' },
    { range: '61-80%', count: 82, fill: '#a6ff4d' },
    { range: '81-100%', count: 34, fill: '#4dff4d' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Admin Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card data-testid="card-stat-students">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalStudents ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-institutions">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <School className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalInstitutions ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Institutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-quizzes">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalQuizzes ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-states">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalStates ?? 0}</p>
                    <p className="text-xs text-muted-foreground">States</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-districts">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalDistricts ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Districts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-chapters">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.totalChapters ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Chapters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-attempts">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{dashboard?.recentAttempts ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-avg-score">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(dashboard?.averageScore ?? 0)}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="range" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {!activity || activity.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="text-no-activity">No recent activity</p>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-sm border-b last:border-0 pb-3" data-testid={`activity-item-${item.id}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs leading-relaxed">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>

  );
}
