import { SearchX } from 'lucide-react';

export function CompetitionEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
        <SearchX className="w-7 h-7 text-gray-400" />
      </span>
      <h3 className="text-lg font-semibold text-gray-800">
        Kompetisi tidak ditemukan
      </h3>
      <p className="max-w-sm text-sm text-gray-600">
        Coba ubah kata kunci pencarian atau filter status untuk menemukan
        kompetisi yang sesuai.
      </p>
    </div>
  );
}
