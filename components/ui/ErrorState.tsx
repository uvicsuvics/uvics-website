import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Bila diisi, tombol "Coba lagi" tampil. Di error.tsx teruskan reset dari Next.js. */
  onRetry?: () => void;
  className?: string;
}

/** Jelaskan apa yang gagal dan apa yang bisa dilakukan pengguna. */
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
        "flex flex-col items-center gap-3 px-6 py-12 text-center bg-error/5 rounded-xl border border-error/30",
        className,
      )}
    >
      <h2 className="font-heading text-xl font-semibold text-error">{title}</h2>
      <p className="max-w-md text-gray-600">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="md" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
