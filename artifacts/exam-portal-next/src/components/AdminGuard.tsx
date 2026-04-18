"use client";

import { useGetMe } from "@workspace/api-client-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useGetMe();

  useEffect(() => {
    console.log("[AdminGuard] State:", { isLoading, isError, user });
    if (!isLoading && (isError || !user)) {
      console.warn("[AdminGuard] Not authenticated, redirecting to sign-in");
      router.push("/sign-in");
    } else if (!isLoading && user) {
      const isAdmin = user.role && ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role);
      console.log("[AdminGuard] User role:", user.role, "IsAdmin:", isAdmin);
      if (!isAdmin) {
        console.warn("[AdminGuard] Not admin, redirecting to student dashboard");
        router.push("/student/dashboard");
      }
    }
  }, [user, isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
