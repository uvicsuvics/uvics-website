import { Button } from "@/src/components/atoms/Button/Button";
import { cn } from "@/src/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Jika diisi, tombol "Coba lagi" tampil. Di error.tsx gunakan retry dari Next.js. */
  onRetry?: () => void;
  className?: string;
}

/** State Error. Jelaskan apa yang terjadi dan apa yang bisa dilakukan pengguna. */
export function ErrorState({
  title = "Data tidak dapat dimuat",
  message = "Terjadi kesalahan saat mengambil data. Coba lagi dalam beberapa saat.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-100/40 px-6 py-12 text-center",
        className,
      )}
    >
      <h2 className="font-heading text-xl font-semibold text-red-600">
        {title}
      </h2>
      <p className="max-w-md text-gray-600">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="md" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
