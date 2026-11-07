import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDayMonth } from '@/lib/format/date';
import { COMPETITION_STATUS_LABELS, CONTENT_LEVEL_LABELS } from '@/lib/format/labels';
import { cn } from '@/lib/utils';
import type { Competition, CompetitionGroup, CompetitionStatus } from '@/types/competition';

const ARCHIVED: readonly CompetitionStatus[] = ['CLOSED', 'FINISHED'];

const TILE_CLASS: Record<CompetitionStatus, string> = {
  OPEN: 'bg-primary text-white',
  UPCOMING: 'bg-primary-50 text-primary',
  ONGOING: 'bg-secondary text-gray-900',
  CLOSED: 'bg-muted text-gray-700',
  FINISHED: 'bg-muted text-gray-700',
};

// Ubin memakai tanggal yang sama dengan kunci urutan grup (groupCompetitions): batas pendaftaran
// untuk yang masih bisa didaftar, tanggal pelaksanaan untuk yang pendaftarannya sudah tutup.
const showsEventDate = (status: CompetitionStatus) => status !== 'OPEN' && status !== 'UPCOMING';

function CompetitionTimelineRow({ competition }: { competition: Competition }) {
  const { slug, title, organizer, level, category, status, registrationDeadline, competitionDate } = competition;
  const eventFirst = showsEventDate(status);
  const tileDate = eventFirst ? competitionDate : registrationDeadline;
  const tile = tileDate ? formatDayMonth(tileDate) : null;
  const otherDate = eventFirst ? registrationDeadline : competitionDate;

  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 border-b border-gray-200/90">
      <span
        className={cn(
          'flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-lg leading-none',
          TILE_CLASS[status],
        )}
      >
        <span className="sr-only">{eventFirst ? 'Pelaksanaan' : 'Batas pendaftaran'}</span>
        {tile ? (
          <>
            <span className="text-[11px] font-bold uppercase">{tile.month}</span>
            <span className="font-heading text-2xl font-bold">{tile.day}</span>
          </>
        ) : (
          <span className="px-1 text-[11px] font-semibold text-center leading-tight">Belum ditentukan</span>
        )}
      </span>

      <div className="flex flex-col flex-1 gap-1 min-w-0 basis-64">
        <h3 className="text-base font-semibold leading-snug text-gray-900">
          <Link href={`/competitions/${slug}`} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600">{organizer}</p>
        {(level || category) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {level && <Badge variant="secondary">{CONTENT_LEVEL_LABELS[level]}</Badge>}
            {category && <Badge variant="primary">{category}</Badge>}
          </div>
        )}
      </div>

      <p className="flex flex-col w-40 text-xs text-gray-500">
        {eventFirst ? 'Batas pendaftaran' : 'Pelaksanaan'}
        <span className="text-sm font-semibold text-gray-800">
          {otherDate ? formatDate(otherDate) : 'Belum ditentukan'}
        </span>
      </p>

      <Button href={`/competitions/${slug}`} variant="outline" size="sm" aria-label={`Lihat detail ${title}`}>
        Detail
      </Button>
    </li>
  );
}

function GroupSection({ group }: { group: CompetitionGroup }) {
  const headingId = `grup-${group.status.toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3 pb-2.5 border-b-2 border-gray-900">
        <h2 id={headingId} className="font-heading text-2xl font-bold text-gray-900">
          {COMPETITION_STATUS_LABELS[group.status]}
        </h2>
        <span className="text-sm text-gray-500">{group.items.length} kompetisi</span>
      </div>
      <ul>
        {group.items.map((competition) => (
          <CompetitionTimelineRow key={competition.id} competition={competition} />
        ))}
      </ul>
    </section>
  );
}

interface CompetitionTimelineProps {
  groups: CompetitionGroup[];
  /** Tampilkan grup ditutup/selesai terbuka; dipakai saat filter status memilih salah satunya. */
  expandArchived?: boolean;
}

/**
 * Daftar kompetisi per status. Grup ditutup dan selesai disimpan di balik `<details>`
 * kecuali `expandArchived`.
 * @param groups - Grup dari `getCompetitionBoard`
 * @param expandArchived - Tampilkan arsip tanpa dilipat
 */
export function CompetitionTimeline({ groups, expandArchived = false }: CompetitionTimelineProps) {
  const active = expandArchived ? groups : groups.filter((g) => !ARCHIVED.includes(g.status));
  const archived = expandArchived ? [] : groups.filter((g) => ARCHIVED.includes(g.status));
  const archivedCount = archived.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex flex-col gap-10">
      {active.map((group) => (
        <GroupSection key={group.status} group={group} />
      ))}
      {archivedCount > 0 && (
        // Terbuka bila hanya arsip yang cocok, supaya hasil pencarian tidak tersembunyi.
        <details open={active.length === 0} className="group/archive flex flex-col gap-10">
          <summary className="inline-flex items-center gap-2 self-start px-4 py-3 rounded-lg bg-muted text-sm font-semibold text-gray-700 cursor-pointer list-none transition-colors hover:bg-gray-200 [&::-webkit-details-marker]:hidden">
            Kompetisi yang sudah ditutup atau selesai ({archivedCount})
            <ChevronDown className="w-4 h-4 transition-transform group-open/archive:rotate-180" aria-hidden="true" />
          </summary>
          <div className="flex flex-col gap-10 pt-8">
            {archived.map((group) => (
              <GroupSection key={group.status} group={group} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
