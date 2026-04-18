"use client";

import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminDashboard, useGetRecentActivity } from "@workspace/api-client-react";
import { Users, School, ClipboardList, MapPin, Building, BookOpen, Award, TrendingUp, BarChart3, Activity } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const statCards = (d: any) => [
  { label: "Students", value: d?.totalStudents ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "Institutions", value: d?.totalInstitutions ?? 0, icon: School, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { label: "Quizzes", value: d?.totalQuizzes ?? 0, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "States", value: d?.totalStates ?? 0, icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { label: "Districts", value: d?.totalDistricts ?? 0, icon: Building, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { label: "Chapters", value: d?.totalChapters ?? 0, icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { label: "Attempts", value: d?.recentAttempts ?? 0, icon: Award, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { label: "Avg Score", value: `${Math.round(d?.averageScore ?? 0)}%`, icon: TrendingUp, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
];

const distributionData = [
  { range: "0–20%", count: 12 },
  { range: "21–40%", count: 18 },
  { range: "41–60%", count: 45 },
  { range: "61–80%", count: 82 },
  { range: "81–100%", count: 34 },
];
const barColors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#34d399"];

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const { data: activity } = useGetRecentActivity();

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight" data-testid="text-admin-dashboard-title">
              Overview
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Welcome back — here's what's happening today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <i className="bi bi-circle-fill text-[6px] animate-pulse" />
            Live
          </div>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards(dashboard).map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
              >
                <Card className={`border ${s.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-foreground tracking-tight">{s.value}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="grid md:grid-cols-5 gap-4">

          {/* Score distribution — wider */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Card className="h-full border-border/60">
              <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Score Distribution
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">Student performance across score bands</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={distributionData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "10px", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {distributionData.map((_, idx) => (
                          <Cell key={idx} fill={barColors[idx]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent activity — narrower */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <Card className="h-full border-border/60">
              <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  Recent Activity
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">Latest platform events</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {!activity || activity.length === 0 ? (
                  <div className="h-[220px] flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium" data-testid="text-no-activity">No recent activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {activity.map((item, idx) => (
                      <div key={item.id} className="flex items-start gap-3" data-testid={`activity-item-${item.id}`}>
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="flex-1 min-w-0 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                          <p className="text-[11px] font-medium text-foreground leading-relaxed">{item.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          <Card className="border-border/60">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <i className="bi bi-lightning-fill text-amber-500 text-xs" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Add Quiz", icon: "bi-plus-circle-fill", href: "/admin/quizzes", color: "text-primary bg-primary/10 hover:bg-primary/20" },
                  { label: "Manage Users", icon: "bi-people-fill", href: "/admin/users", color: "text-violet-500 bg-violet-500/10 hover:bg-violet-500/20" },
                  { label: "Add Chapter", icon: "bi-file-earmark-plus-fill", href: "/admin/chapters", color: "text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20" },
                  { label: "View Results", icon: "bi-bar-chart-fill", href: "/admin/quizzes", color: "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" },
                ].map((action) => (
                  <a key={action.label} href={action.href} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${action.color}`}>
                    <i className={`bi ${action.icon} text-sm`} />
                    {action.label}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </AdminLayout>
  );
}
