import { requirePageAdmin } from "@/lib/auth/page";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requirePageAdmin();

  return (
    <div className="flex min-h-screen bg-muted text-gray-900">
      {/* Desktop Persistent Sidebar */}
      <AdminSidebar className="hidden lg:flex shrink-0" />

      {/* Main Content Shell */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar adminName={admin.name} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
