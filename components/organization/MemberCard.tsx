import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { PublicMember } from "@/lib/backend/dto";

interface MemberCardProps {
  member: PublicMember;
}

/**
 * Kartu pengurus berisi field D02 saja (nama, foto, posisi). Avatar inisial netral
 * dipakai selama foto PUBLIC belum ada, supaya foto kegiatan tidak dilabeli nama orang.
 */
export function MemberCard({ member }: MemberCardProps) {
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <div className="flex items-center gap-4 h-full p-5 bg-white rounded-2xl border border-gray-200">
      <div className="flex shrink-0 items-center justify-center overflow-hidden w-12 h-12 font-semibold text-primary bg-primary-50 rounded-full">
        {member.photo ? (
          <CloudinaryImage asset={member.photo} alt={`Foto ${member.name}`} width={48} height={48} sizes="48px" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900">{member.name}</p>
        <p className="text-sm text-gray-600">{member.position}</p>
      </div>
    </div>
  );
}
