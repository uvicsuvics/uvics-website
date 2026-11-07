import { UserRound } from 'lucide-react';
import { MEMBER_NAME_FALLBACK } from '@/components/portfolio/portfolioLabels';
import type { PortfolioTeamMember } from '@/types/portfolio';

interface TeamMemberListProps {
  members: PortfolioTeamMember[];
}

/**
 * Daftar anggota tim pada halaman detail prestasi dan project.
 * Anggota tanpa nama publik tampil sebagai `MEMBER_NAME_FALLBACK`.
 * @param members - Anggota tim yang sudah digabung oleh service
 */
export function TeamMemberList({ members }: TeamMemberListProps) {
  if (members.length === 0) {
    return <p className="text-sm text-gray-500">Data tim belum tersedia.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-gray-200/90 shadow-2xs"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary shrink-0">
            <UserRound className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{member.name ?? MEMBER_NAME_FALLBACK}</p>
            {member.role ? <p className="text-xs text-gray-500 truncate">{member.role}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
