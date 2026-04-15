"use client";

import AdminQuizDetail from "@/pages/admin/quiz-detail";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminQuizDetail quizId={Number(id)} />;
}
