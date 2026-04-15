"use client";

import AdminContent from "@/pages/admin/content";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminContent chapterId={Number(id)} />;
}
