import StudentLayout from "@/components/student-layout";
import { StudentGuard } from "@/components/StudentGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentGuard>
      <StudentLayout>{children}</StudentLayout>
    </StudentGuard>
  );
}
