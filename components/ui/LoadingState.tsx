import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** Loading untuk satu area atau halaman. Untuk grid kartu pakai ListSkeleton. */
export function LoadingState({ label = "Memuat data...", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-3 py-16 text-gray-600", className)}
    >
      <span
        aria-hidden="true"
        className="size-8 rounded-full border-4 border-primary-100 border-t-primary animate-spin motion-reduce:animate-none"
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

/** Placeholder grid kartu untuk fallback <Suspense> dan loading.tsx. */
export function ListSkeleton({ count = 6, className }: ListSkeletonProps) {
  return (
    <div role="status" aria-label="Memuat data" className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-48 bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
      ))}
    </div>
  );
}
