import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Data tidak ditemukan"
      message="Data yang Anda buka tidak ada atau sudah dihapus."
      action={
        <Button href="/admin/dashboard" variant="outline" size="sm">
          Kembali ke dashboard
        </Button>
      }
      className="bg-white"
    />
  );
}
