import { requirePageAdmin } from "@/src/lib/auth/page";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageAdmin();
  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-primary-100 bg-white px-6 py-5 font-bold text-primary">
        UVICS · Admin
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
