import { EmptyState } from "@/components/ui/EmptyState";

interface PagePlaceholderProps {
  title: string;
  description: string;
  /** Pesan kosong; pakai teks spesifikasi §23 bila halaman punya padanannya. */
  message?: string;
}

/** Kerangka route publik yang halamannya belum dibangun, agar link navigasi tidak 404. */
export function PagePlaceholder({
  title,
  description,
  message = "Konten halaman ini sedang disiapkan.",
}: PagePlaceholderProps) {
  return (
    <section className="flex flex-col gap-8 mx-auto px-4 py-16 w-full max-w-7xl sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-3 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-gray-900 md:text-5xl">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
      <EmptyState message={message} />
    </section>
  );
}
