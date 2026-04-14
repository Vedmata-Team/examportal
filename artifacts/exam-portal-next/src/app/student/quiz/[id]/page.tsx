"use client";

import StudentQuizAttempt from "@/pages/student/quiz-attempt";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StudentQuizAttempt quizId={Number(id)} />;
}
