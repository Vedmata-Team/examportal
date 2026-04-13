import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { LayoutDashboard, MapPin, Building, School, Users, BookOpen, FileText, ClipboardList, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/states", label: "States", icon: MapPin },
  { href: "/admin/districts", label: "Districts", icon: Building },
  { href: "/admin/institutions", label: "Institutions", icon: School },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: BookOpen },
  { href: "/admin/chapters", label: "Chapters", icon: FileText },
  { href: "/admin/quizzes", label: "Quizzes", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col" data-testid="sidebar-admin">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/">
            <span className="text-lg font-bold text-sidebar-foreground cursor-pointer">ExamPlatform</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  data-testid={`link-admin-${item.label.toLowerCase()}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-sm text-muted-foreground mb-2 truncate" data-testid="text-admin-email">
            {user?.emailAddresses?.[0]?.emailAddress}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => signOut()}
            data-testid="button-sign-out"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
