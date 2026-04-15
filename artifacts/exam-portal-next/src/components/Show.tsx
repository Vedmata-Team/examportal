"use client";

import { Show as ClerkShow } from "@clerk/nextjs";
import { useGetMe } from "@workspace/api-client-react";

import { hasClerk } from "@/lib/constants";

export function Show({ 
  when, 
  children 
}: { 
  when: "signed-in" | "signed-out", 
  children: React.ReactNode 
}) {
  const { data: user, isLoading } = useGetMe();

  // If Clerk is enabled, use Clerk's Show component
  if (hasClerk) {
    return <ClerkShow when={when}>{children}</ClerkShow>;
  }

  // If Clerk is disabled (Bypass Mode/Local Auth)
  if (isLoading) return null;

  if (when === "signed-in") {
    return user ? <>{children}</> : null;
  }

  return !user ? <>{children}</> : null;
}
