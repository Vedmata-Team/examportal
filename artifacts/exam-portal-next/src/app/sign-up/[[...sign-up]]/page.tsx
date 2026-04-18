"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

import { hasClerk } from "@/lib/constants";

function LocalAuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const authMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = mode === "sign-in" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Authentication failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      router.push("/");
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "sign-up" && !name) {
      setError("Name is required");
      return;
    }
    authMutation.mutate({ email, password, name });
  };

  return (
    <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="p-3 bg-primary/10 rounded-full">
          <i className="bi bi-book-half text-2xl text-primary" />
        </div>
        <h1 className="text-2xl font-bold">ExamPlatform</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "sign-in" ? "Welcome back! Sign in to continue." : "Create a new account."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <i className="bi bi-person absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <div className="relative">
            <i className="bi bi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <i className="bi bi-lock absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={8}
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={authMutation.isPending}>
          {authMutation.isPending ? "Connecting..." : mode === "sign-in" ? "Sign In" : "Register"}
        </Button>

        <div className="text-center text-sm text-muted-foreground pt-4">
          {mode === "sign-in" ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"} className="text-primary font-semibold hover:underline">
            {mode === "sign-in" ? "Sign up" : "Sign in"}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <LocalAuthForm mode="sign-up" />
    </div>
  );
}
