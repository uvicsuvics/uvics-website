import Image from 'next/image';
import { BookOpen, Calendar, ExternalLink, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Competition } from '@/types/competition';

const CTA_BASE =
  'inline-flex items-center justify-center font-medium rounded-[10px] py-4 px-8 text-lg transition-all duration-250 ease-standard';
const CTA_VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-600 hover:shadow-primary',
  outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary-50',
};

interface CompetitionDetailContentProps {
  competition: Competition;
}

function formatDate(value: string | null) {
  if (!value) return 'Belum ditentukan';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function CompetitionDetailContent({ competition }: CompetitionDetailContentProps) {
  const {
    poster,
    title,
    description,
    registrationDeadline,
    competitionDate,
    teamSize,
    eligibility,
    registrationUrl,
    guidebookUrl,
    status,
  } = competition;

  const keyInfo = [
    {
      icon: Calendar,
      label: 'Deadline Pendaftaran',
      value: formatDate(registrationDeadline),
    },
    {
      icon: Calendar,
      label: 'Tanggal Kompetisi',
      value: formatDate(competitionDate),
    },
    {
      icon: Users,
      label: 'Ukuran Tim',
      value: teamSize ?? 'Belum ditentukan',
    },
    {
      icon: BookOpen,
      label: 'Kriteria Kelayakan',
      value: eligibility ?? 'Belum ditentukan',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden bg-primary-50">
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
                <Trophy className="w-16 h-16 text-primary-200" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">Deskripsi</h2>
            <p className="text-base text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 p-6 bg-card border border-gray-200 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Informasi Penting</h2>

            <dl className="flex flex-col gap-4">
              {keyInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-sm text-gray-500">{label}</dt>
                    <dd className="text-base font-medium text-gray-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            {registrationUrl && (
              <a
                href={registrationUrl}
                target={status === 'OPEN' ? '_blank' : undefined}
                rel={status === 'OPEN' ? 'noopener noreferrer' : undefined}
                className={cn(CTA_BASE, CTA_VARIANTS.primary)}
              >
                Daftar Sekarang
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            )}

            {guidebookUrl && (
              <a
                href={guidebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(CTA_BASE, CTA_VARIANTS.outline)}
              >
                Lihat Guidebook
                <BookOpen className="w-4 h-4 ml-2" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
