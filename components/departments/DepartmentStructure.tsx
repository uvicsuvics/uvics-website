import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { PublicMember } from "@/lib/backend/dto";
import { cn } from "@/lib/utils";

// shortcut: level bagan dan urutannya dari nama posisi resmi (PRD §13); ganti ke positions.level setelah U08 diputuskan.
const LEVEL_ORDER = ["Steering Helper", "Koordinator", "PIC", "Anggota"];
/** Posisi yang digambar sebagai satu blok daftar nama, bukan kartu per orang. */
const LIST_LEVEL = "Anggota";

export interface PositionLevel {
  position: string;
  members: PublicMember[];
}

/**
 * Mengelompokkan pengurus per posisi. Urutan level mengikuti LEVEL_ORDER; posisi lain menyusul
 * sesuai urutan kemunculan. Urutan orang dalam satu level tidak diubah.
 */
export function groupByPosition(members: PublicMember[]): PositionLevel[] {
  const groups = new Map<string, PublicMember[]>();
  for (const member of members) {
    groups.set(member.position, [...(groups.get(member.position) ?? []), member]);
  }
  const rank = (position: string) => {
    const index = LEVEL_ORDER.indexOf(position);
    return index === -1 ? LEVEL_ORDER.length : index;
  };
  return [...groups]
    .map(([position, people]) => ({ position, members: people }))
    .sort((a, b) => rank(a.position) - rank(b.position));
}

interface DepartmentStructureProps {
  /** Nama bagan untuk pembaca layar, mis. "Struktur pengurus Web Development". */
  label: string;
  members: PublicMember[];
}

/**
 * Bagan struktur pengurus satu departemen: Steering Helper, Koordinator, dan PIC sebagai kartu
 * yang disambung garis, lalu Anggota dalam satu blok daftar nama.
 */
export function DepartmentStructure({ label, members }: DepartmentStructureProps) {
  return (
    <ol aria-label={label} className="flex flex-col items-center px-4 py-10 bg-primary-50 rounded-3xl sm:px-8 sm:py-12">
      {groupByPosition(members).map(({ position, members: people }, index) => (
        <li key={position} className="flex flex-col items-center w-full">
          {index > 0 && <span aria-hidden="true" className="w-px h-8 bg-primary-300" />}
          {position === LIST_LEVEL ? (
            <MemberList position={position} members={people} />
          ) : (
            <ul className="flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8">
              {people.map((member, memberIndex) => (
                <li
                  key={`${member.name}-${memberIndex}`}
                  className={cn(
                    "relative",
                    // Garis cabang untuk beberapa orang di satu level. shortcut: baris yang terbungkus tidak punya garis sendiri, cukup sampai ada level dengan banyak orang.
                    people.length > 1 &&
                      "sm:pt-6 sm:before:absolute sm:before:top-0 sm:before:left-1/2 sm:before:w-px sm:before:h-6 sm:before:bg-primary-300 sm:after:absolute sm:after:top-0 sm:after:-left-4 sm:after:-right-4 sm:after:h-px sm:after:bg-primary-300 sm:first:after:left-1/2 sm:last:after:right-1/2",
                  )}
                >
                  <MemberNode member={member} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

function MemberNode({ member }: { member: PublicMember }) {
  return (
    <div className="flex items-center w-72 max-w-full">
      <MemberAvatar member={member} className="z-10 w-16 h-16 text-lg ring-4 ring-white" />
      <div className="flex-1 min-w-0 -ml-5 overflow-hidden rounded-r-xl shadow-sm">
        <p className="py-1 pr-4 pl-8 text-xs font-bold tracking-wider uppercase text-gray-900 bg-secondary">
          {member.position}
        </p>
        <p className="py-2 pr-4 pl-8 text-sm font-semibold text-white truncate bg-primary-900">{member.name}</p>
      </div>
    </div>
  );
}

function MemberList({ position, members }: PositionLevel) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl shadow-sm">
      <p className="px-4 py-2 text-xs font-bold tracking-wider text-center uppercase text-gray-900 bg-secondary">
        {position}
      </p>
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 px-5 py-5 bg-primary-900">
        {members.map((member, index) => (
          <li key={`${member.name}-${index}`} className="flex items-center gap-3 min-w-0 w-full sm:w-52">
            <MemberAvatar member={member} className="w-9 h-9 text-xs ring-2 ring-primary-700" />
            <span className="text-sm font-medium text-white truncate">{member.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Foto PUBLIC bila ada; selain itu inisial netral (D02). */
function MemberAvatar({ member, className }: { member: PublicMember; className: string }) {
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-semibold text-primary bg-primary-100 rounded-full",
        className,
      )}
    >
      {member.photo ? (
        <CloudinaryImage asset={member.photo} alt={`Foto ${member.name}`} width={64} height={64} sizes="64px" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
