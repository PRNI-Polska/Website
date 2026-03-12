// file: app/admin/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminDashboardShell } from "./admin-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <AdminDashboardShell user={session.user}>{children}</AdminDashboardShell>;
}
