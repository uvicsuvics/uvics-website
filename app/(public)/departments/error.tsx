"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function RouteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="px-6 pt-28 pb-16 mx-auto w-full max-w-7xl md:px-8">
      <ErrorState onRetry={retry} />
    </div>
  );
}
