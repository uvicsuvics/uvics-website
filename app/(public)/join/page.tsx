import type { Metadata } from "next";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { toPublicSettings } from "@/lib/backend/dto";
import { REGISTRATION_CLOSED_MESSAGE } from "@/lib/backend/registration";
import { serverClient } from "@/lib/supabase/server";

const description = "Informasi pendaftaran anggota baru UVICS.";

export const metadata: Metadata = { title: "Join UVICS", description };

// Gagal membaca settings diperlakukan sebagai tertutup (kontrak read_public_settings).
async function registrationIsOpen() {
  try {
    const client = await serverClient();
    const { data, error } = await client.rpc("read_public_settings");
    if (error) return false;
    return toPublicSettings(data).registration_open === true;
  } catch {
    return false;
  }
}

export default async function JoinPage() {
  const open = await registrationIsOpen();
  return (
    <section className="flex flex-col gap-8 mx-auto px-4 py-16 w-full max-w-3xl sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-bold text-gray-900 md:text-5xl">
          Join UVICS
        </h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
      {open ? (
        <RegistrationForm />
      ) : (
        <EmptyState message={REGISTRATION_CLOSED_MESSAGE} />
      )}
    </section>
  );
}
