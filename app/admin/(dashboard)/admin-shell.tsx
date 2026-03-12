"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

interface AdminDashboardShellProps {
  user: { email: string; name?: string | null };
  children: React.ReactNode;
}

export function AdminDashboardShell({ user, children }: AdminDashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 bg-muted/30 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
