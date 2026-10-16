import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title: string;
  message?: string;
  className?: string;
}

/** Hasil aksi pengguna (submit registrasi, simpan data), bukan hasil fetch data. */
export function SuccessState({ title, message, className }: SuccessStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-2 px-6 py-10 text-center bg-success/10 rounded-xl border border-success/30",
        className,
      )}
    >
      <CircleCheck aria-hidden="true" className="size-8 text-success" strokeWidth={1.5} />
      {/* Judul tetap gray-900: hijau success di atas latar terang kurang dari kontras 4.5:1. */}
      <h2 className="font-heading text-xl font-semibold text-gray-900">{title}</h2>
      {message ? <p className="max-w-md text-gray-700">{message}</p> : null}
    </div>
  );
}
