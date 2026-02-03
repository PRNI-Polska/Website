// file: app/admin/login/page.tsx
import { Suspense } from "react";
import AdminLoginClient from "./admin-login-client";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="text-muted-foreground">Loading…</div>
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
