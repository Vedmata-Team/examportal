"use client";

import AdminQuizDetail from "@/legacy-pages/quiz-detail";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminQuizDetail quizId={Number(id)} />;
}
