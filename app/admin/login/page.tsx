import Link from "next/link";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/backend/errors";
import { AdminLoginForm } from "@/components/forms/AdminLoginForm";
export const metadata = {
  title: "Login Admin | UVICS",
  robots: { index: false, follow: false },
};
export default async function AdminLoginPage() {
  let authenticated = false;
  try {
    await requireAdmin(await serverClient());
    authenticated = true;
  } catch (error) {
    if (
      !(error instanceof AppError) ||
      !["UNAUTHENTICATED", "FORBIDDEN"].includes(error.code)
    )
      throw error;
  }
  if (authenticated) redirect("/admin/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-primary-100 bg-white p-7 shadow-sm sm:p-9">
        <Link
          href="/"
          className="text-sm font-bold tracking-widest text-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          UVICS
        </Link>
        <h1 className="mt-6 mb-2 font-heading text-3xl">Login Admin</h1>
        <p className="mb-8 text-sm text-gray-600">
          Masuk untuk mengelola website dan data organisasi.
        </p>
        <AdminLoginForm />
        <p className="mt-6 text-sm text-gray-600">
          Akses diberikan oleh pengelola UVICS.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4"
        >
          Kembali ke website
        </Link>
      </section>
    </main>
  );
}
