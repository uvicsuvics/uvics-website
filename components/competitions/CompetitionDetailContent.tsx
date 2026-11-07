import Image from 'next/image';
import { BookOpen, ExternalLink, GraduationCap, Trophy, Users } from 'lucide-react';
import { DateTile, STATUS_TILE_CLASS, competitionDates } from '@/components/competitions/DateTile';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format/date';
import { CONTENT_LEVEL_LABELS } from '@/lib/format/labels';
import type { Competition } from '@/types/competition';

interface CompetitionDetailContentProps {
  competition: Competition;
}

const NOT_SET = 'Belum ditentukan';

/**
 * Isi detail kompetisi: poster, deskripsi, syarat dan format di kiri; ringkasan pendaftaran
 * dengan tombol daftar dan guidebook di kanan.
 * @param competition - Kompetisi yang ditampilkan
 */
export function CompetitionDetailContent({ competition }: CompetitionDetailContentProps) {
  const { poster, title, description, category, level, teamSize, eligibility, registrationUrl, guidebookUrl, status } =
    competition;
  const { primary, secondary } = competitionDates(competition);

  const summary = [
    { label: secondary.label, value: secondary.date ? formatDate(secondary.date) : NOT_SET },
    level ? { label: 'Tingkat', value: CONTENT_LEVEL_LABELS[level] } : null,
    category ? { label: 'Kategori', value: category } : null,
  ].filter((row) => row !== null);

  const requirements = [
    eligibility ? { icon: GraduationCap, label: 'Syarat peserta', value: eligibility } : null,
    teamSize ? { icon: Users, label: 'Format tim', value: teamSize } : null,
  ].filter((item) => item !== null);

  return (
    <div className="grid gap-10 mx-auto px-6 py-10 w-full max-w-7xl md:px-8 md:py-14 lg:grid-cols-3 lg:gap-12">
      {/* Ringkasan lebih dulu di DOM: di layar kecil tombol daftar langsung terlihat dan urutan baca
          sama dengan urutan tampil; di desktop kolom ini dipindah ke kanan. */}
      <aside
        aria-label="Ringkasan pendaftaran"
        className="flex flex-col gap-5 p-6 h-fit bg-card rounded-xl border border-gray-200/90 shadow-md lg:order-last lg:sticky lg:top-28"
      >
        <div className="flex items-center gap-4">
          <DateTile date={primary.date} label={primary.label} decorative className={STATUS_TILE_CLASS[status]} />
          <span className="flex flex-col min-w-0">
            <span className="text-sm text-gray-600">{primary.label}</span>
            <span className="text-lg font-bold text-gray-900">
              {primary.date ? formatDate(primary.date, 'long') : NOT_SET}
            </span>
          </span>
        </div>

        <dl className="flex flex-col border-t border-gray-100">
          {summary.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-3 py-3 border-b border-gray-100 last:border-b-0">
              <dt className="text-sm text-gray-600">{label}</dt>
              <dd className="text-sm font-semibold text-right text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        {(registrationUrl || guidebookUrl) && (
          <div className="flex flex-col gap-3">
            {registrationUrl && (
              // Tab baru hanya saat pendaftaran dibuka; perilaku CTA per status dibahas di #45.
              <Button href={registrationUrl} external={status === 'OPEN'} variant="primary" size="lg" className="w-full gap-2">
                Daftar Sekarang
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
            {guidebookUrl && (
              <Button href={guidebookUrl} external variant="outline" size="lg" className="w-full gap-2">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Lihat Guidebook
              </Button>
            )}
            {registrationUrl && (
              <p className="text-sm text-center text-gray-600">Pendaftaran dilakukan di situs penyelenggara.</p>
            )}
          </div>
        )}
      </aside>

      <div className="flex flex-col gap-10 min-w-0 lg:col-span-2">
        <div className="relative w-full h-64 overflow-hidden rounded-xl bg-primary-50 md:h-96">
          {poster ? (
            <Image
              src={poster}
              alt={`Poster ${title}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Trophy className="w-16 h-16 text-primary-200" aria-hidden="true" />
            </div>
          )}
        </div>

        <section aria-labelledby="tentang-kompetisi" className="flex flex-col gap-3">
          <h2 id="tentang-kompetisi" className="font-heading text-2xl font-bold text-gray-900">
            Tentang kompetisi
          </h2>
          <p className="text-base leading-relaxed text-gray-700 md:text-lg">{description}</p>
        </section>

        {requirements.length > 0 && (
          <section aria-labelledby="syarat-format" className="flex flex-col gap-4">
            <h2 id="syarat-format" className="font-heading text-2xl font-bold text-gray-900">
              Syarat dan format
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {requirements.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3.5 p-5 rounded-xl border border-gray-200/90">
                  <span className="flex items-center justify-center shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
