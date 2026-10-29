import { LoadingState } from "@/components/ui/LoadingState";

export default function Loading() {
  // pt-28 menjaga indikator tetap di bawah navbar publik yang fixed.
  return <LoadingState className="pt-28" />;
}
