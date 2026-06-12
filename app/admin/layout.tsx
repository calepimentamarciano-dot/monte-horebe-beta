import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-32">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
