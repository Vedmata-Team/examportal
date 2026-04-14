"use client";

import { useGetMe } from "@workspace/api-client-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function StudentGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useGetMe();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push("/sign-in");
    } else if (!isLoading && user) {
      if (user.role !== "STUDENT") {
        router.push("/admin/dashboard");
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
