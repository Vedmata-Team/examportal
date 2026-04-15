import AdminLayout from "@/components/admin-layout";
import { AdminGuard } from "@/components/AdminGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
