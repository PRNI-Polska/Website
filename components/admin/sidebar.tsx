// file: components/admin/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Book,
  Users,
  PenLine,
  ExternalLink,
  Phone,
  BarChart3,
  Mail,
  Shield,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Announcements", href: "/admin/announcements", icon: FileText },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Manifesto", href: "/admin/manifesto", icon: Book },
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Blog", href: "/admin/blog", icon: PenLine },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Members", href: "/admin/members", icon: Shield },
  { name: "Security", href: "/admin/security", icon: ShieldAlert },
  { name: "Komunikator", href: "/admin/calls", icon: Phone },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "bg-background border-r flex flex-col z-50",
        "fixed inset-y-0 left-0 w-64 transition-transform duration-200 md:relative md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
              P
            </div>
            <span className="font-heading font-semibold">Admin</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* View Site Link */}
        <div className="p-4 border-t">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
        </div>
      </aside>
    </>
  );
}
