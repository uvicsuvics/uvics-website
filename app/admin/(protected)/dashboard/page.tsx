import { requirePageAdmin } from "@/lib/auth/page";
import { AdminLogoutButton } from "@/components/forms/AdminLogoutButton";
export const metadata = { title: "Dashboard Admin | UVICS" };
export default async function DashboardPage() {
  const admin = await requirePageAdmin();
  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-6 sm:p-8">
      <h1 className="font-heading text-3xl">Dashboard Admin</h1>
      <p className="mt-4">Selamat datang, {admin.name}.</p>
      <p className="mt-2 mb-7 max-w-xl text-sm text-gray-600">
        Sesi ini berlaku maksimal satu jam sejak login. Keluar dari sesi ini
        tidak mengakhiri sesi di perangkat lain.
      </p>
      <AdminLogoutButton />
    </section>
  );
}
