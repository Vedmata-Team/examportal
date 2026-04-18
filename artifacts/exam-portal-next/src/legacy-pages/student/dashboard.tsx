"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStudentDashboard } from "@workspace/api-client-react";
import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import Link from "next/link";

const stats = (d: any) => [
  { label: "Total Attempts",  value: d?.totalAttempts ?? 0,                      icon: "bi-clipboard2-check-fill", color: "text-blue-500",    bg: "bg-blue-500/10",    testId: "card-student-attempts" },
  { label: "Average Score",   value: `${Math.round(d?.averageScore ?? 0)}%`,      icon: "bi-graph-up-arrow",       color: "text-emerald-500", bg: "bg-emerald-500/10", testId: "card-student-avg" },
  { label: "Completed",       value: d?.completedQuizzes ?? 0,                   icon: "bi-award-fill",           color: "text-orange-500",  bg: "bg-orange-500/10",  testId: "card-student-completed" },
  { label: "Available",       value: d?.availableQuizzes ?? 0,                   icon: "bi-book-half",            color: "text-violet-500",  bg: "bg-violet-500/10",  testId: "card-student-available" },
];

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  const chartData = dashboard?.recentScores?.map((s) => ({
    name: new Date(s.submittedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    score: Math.round(s.percentage),
  })).reverse() ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 pb-10"
    >
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-black tracking-tight text-foreground" data-testid="text-student-dashboard-title">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Welcome back — here's your progress overview.</p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats(dashboard).map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              data-testid={s.testId}
            >
              <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <i className={`bi ${s.icon} ${s.color} text-base`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-black text-foreground leading-none">{s.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5 truncate">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-2 px-5 pt-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <i className="bi bi-graph-up text-primary" /> Performance History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-[200px]">
                {isLoading ? (
                  <div className="w-full h-full animate-pulse bg-muted/20 rounded-xl" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} dy={6} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" dot={{ r: 3, fill: "white", strokeWidth: 2.5, stroke: "hsl(var(--primary))" }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 bg-muted/5 rounded-xl border border-dashed border-border/50">
                    <i className="bi bi-graph-up text-2xl text-muted-foreground/20" />
                    <p className="text-xs font-bold text-muted-foreground">Take a quiz to see your trend</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent scores */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-2 px-5 pt-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <i className="bi bi-clock-history text-orange-500" /> Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-muted/20 rounded-xl" />)}</div>
              ) : !dashboard?.recentScores?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <i className="bi bi-award text-2xl text-muted-foreground/20" />
                  <p className="text-xs font-bold text-muted-foreground" data-testid="text-no-scores">No results yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.recentScores.slice(0, 4).map((score, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 3 }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-default"
                      data-testid={`score-item-${idx}`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-foreground truncate">{score.quizTitle}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(score.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${
                        score.percentage >= 70 ? "bg-emerald-500/10 text-emerald-600" :
                        score.percentage >= 40 ? "bg-orange-500/10 text-orange-600" :
                        "bg-red-500/10 text-red-600"
                      }`}>{Math.round(score.percentage)}%</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Browse Chapters", icon: "bi-journal-bookmark-fill", color: "text-blue-500", bg: "bg-blue-500/10", href: "/student/chapters" },
            { label: "View Results",    icon: "bi-bar-chart-fill",         color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/student/results" },
            { label: "Take a Quiz",     icon: "bi-lightning-charge-fill",  color: "text-orange-500", bg: "bg-orange-500/10", href: "/student/chapters" },
          ].map((a) => (
            <Link key={a.label} href={a.href}>
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl ${a.bg} hover:opacity-80 transition-all cursor-pointer group`}>
                <i className={`bi ${a.icon} ${a.color} text-lg`} />
                <span className={`text-xs font-black ${a.color}`}>{a.label}</span>
                <i className={`bi bi-arrow-right ${a.color} text-xs ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  const chartData = dashboard?.recentScores?.map((s) => ({
    name: new Date(s.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: Math.round(s.percentage),
  })).reverse() ?? [];

  const stats = [
    { 
      label: "Total Attempts", 
      value: dashboard?.totalAttempts ?? 0, 
      icon: ClipboardList, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      testId: "card-student-attempts"
    },
    { 
      label: "Average Score", 
      value: `${Math.round(dashboard?.averageScore ?? 0)}%`, 
      icon: TrendingUp, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      testId: "card-student-avg"
    },
    { 
      label: "Completed", 
      value: dashboard?.completedQuizzes ?? 0, 
      icon: Award, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      testId: "card-student-completed"
    },
    { 
      label: "Available", 
      value: dashboard?.availableQuizzes ?? 0, 
      icon: BookOpen, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10",
      testId: "card-student-available"
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-black tracking-tight text-foreground" 
            data-testid="text-student-dashboard-title"
          >
            Student Dashboard
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground font-medium">
            Welcome back! Here's an overview of your academic progress.
          </motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/50">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group" data-testid={stat.testId}>
              <CardContent className="p-0">
                <div className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground leading-tight">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                  </div>
                </div>
                <div className={`h-1 w-full ${stat.bg}`}>
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={`h-full ${stat.color.replace('text', 'bg')}`} 
                   />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Performance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                {isLoading ? (
                  <div className="w-full h-full animate-pulse bg-muted/20 rounded-xl" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                        domain={[0, 100]}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        dot={{ r: 4, fill: 'white', strokeWidth: 3, stroke: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 bg-muted/5 rounded-2xl border border-dashed border-border/50">
                    <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm font-bold text-muted-foreground">Not enough data to show trend</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Scores */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-sm flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/70">Recent Results</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-muted/20 rounded-xl" />)}
                </div>
              ) : !dashboard?.recentScores || dashboard.recentScores.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
                   <Award className="h-10 w-10 text-muted-foreground/30" />
                   <p className="text-xs font-bold text-muted-foreground max-w-[150px]" data-testid="text-no-scores">Take a quiz to see your results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.recentScores.slice(0, 4).map((score, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all cursor-default" 
                      data-testid={`score-item-${idx}`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs text-foreground truncate">{score.quizTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock className="h-3 w-3 text-muted-foreground" />
                           <p className="text-[10px] font-medium text-muted-foreground truncate">{new Date(score.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1.5 rounded-lg font-black text-xs ${
                        score.percentage >= 70 ? "bg-emerald-500/10 text-emerald-600" : 
                        score.percentage >= 40 ? "bg-orange-500/10 text-orange-600" : 
                        "bg-red-500/10 text-red-600"
                      }`}>
                        {Math.round(score.percentage)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
