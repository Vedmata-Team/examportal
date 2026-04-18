"use client";

import StudentChapterView from "@/legacy-pages/student/chapter-view";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StudentChapterView chapterId={Number(id)} />;
}
