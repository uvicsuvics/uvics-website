"use client";
import { Button } from "@/src/components/atoms/Button/Button";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section
      role="alert"
      className="mx-auto my-12 max-w-lg rounded-xl bg-muted p-8"
    >
      <h1 className="font-heading text-2xl">
        Layanan sementara tidak tersedia
      </h1>
      <p className="my-4">
        Kami belum dapat memeriksa sesi. Silakan coba kembali.
      </p>
      <Button onClick={reset}>Coba kembali</Button>
    </section>
  );
}
