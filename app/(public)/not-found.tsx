import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24 text-center">
      <h1 className="font-heading text-3xl font-bold text-primary-900">Halaman tidak ditemukan</h1>
      <p className="mt-4 mb-8 text-gray-600">Konten yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
      <Button variant="primary" size="md" href="/">
        Kembali ke Beranda
      </Button>
    </div>
  );
}
