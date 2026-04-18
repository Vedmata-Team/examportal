"use client";

import { useGetMe } from "@workspace/api-client-react";

export function Show({ 
  when, 
  children 
}: { 
  when: "signed-in" | "signed-out", 
  children: React.ReactNode 
}) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) return null;

  if (when === "signed-in") {
    return user ? <>{children}</> : null;
  }

  return !user ? <>{children}</> : null;
}
