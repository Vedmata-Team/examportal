"use client";

import StudentReview from "@/pages/student/review";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StudentReview id={id} />;
}
