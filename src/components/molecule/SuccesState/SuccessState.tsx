import { cn } from "@/src/lib/utils";

interface SuccessStateProps {
  title: string;
  message?: string;
  className?: string;
}

/** State Success untuk hasil aksi pengguna (submit registrasi, simpan data). Bukan untuk fetch data. */
export function SuccessState({ title, message, className }: SuccessStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-green-600/30 bg-green-100 px-6 py-10 text-center",
        className,
      )}
    >
      <h2 className="font-heading text-xl font-semibold text-green-600">
        {title}
      </h2>
      {message ? <p className="max-w-md text-gray-700">{message}</p> : null}
    </div>
  );
}
