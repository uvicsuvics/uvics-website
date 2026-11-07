import { Users } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { PublicMember } from "@/lib/backend/dto";
import { cn } from "@/lib/utils";

// shortcut: level bagan dan urutannya dari nama posisi resmi (PRD §13); ganti ke positions.level setelah U08 diputuskan.
const LEVEL_ORDER = ["Steering Helper", "Koordinator", "PIC", "Anggota"];
/** Level pimpinan yang digambar sebagai kartu; level lain menjadi cabang berisi daftar nama. */
const CARD_LEVELS = ["Steering Helper", "Koordinator"];

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
 * Bagan struktur pengurus satu departemen: Steering Helper dan Koordinator sebagai kartu bersambung
 * garis, lalu bercabang ke PIC dan Anggota yang masing-masing berupa daftar nama berjudul.
 */
export function DepartmentStructure({ label, members }: DepartmentStructureProps) {
  const levels = groupByPosition(members);
  const cards = levels.filter((level) => CARD_LEVELS.includes(level.position));
  const branches = levels.filter((level) => !CARD_LEVELS.includes(level.position));

  return (
    <ol aria-label={label} className="flex flex-col items-center">
      {cards.map(({ position, members: people }, index) => (
        <li key={position} className="flex flex-col items-center w-full">
          {index > 0 && <Connector />}
          <ul className="flex flex-wrap justify-center gap-6">
            {people.map((member, memberIndex) => (
              <li key={`${member.name}-${memberIndex}`}>
                <LeaderCard member={member} featured={index === 0} />
              </li>
            ))}
          </ul>
        </li>
      ))}

      {branches.length > 0 && (
        <li className="flex flex-col items-center w-full">
          {cards.length > 0 && <Connector />}
          {/* shortcut: lebih dari tiga cabang dibungkus ke baris baru tanpa garis cabang sendiri, cukup sampai ada posisi tambahan. */}
          <ul
            className={cn(
              "grid gap-10 w-full max-w-5xl md:gap-10",
              branches.length === 2 && "md:grid-cols-2",
              branches.length >= 3 && "md:grid-cols-3",
            )}
          >
            {branches.map(({ position, members: people }) => (
              <li
                key={position}
                className={cn(
                  "relative flex flex-col items-center gap-5",
                  branches.length > 1 &&
                    "md:before:block md:before:w-0.5 md:before:h-6 md:before:bg-secondary md:after:absolute md:after:top-0 md:after:-left-5 md:after:-right-5 md:after:h-0.5 md:after:bg-secondary md:first:after:left-1/2 md:last:after:right-1/2",
                )}
              >
                <h3 className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white bg-primary-900 rounded-full shadow-sm">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  {/* Aturan h1-h6 di globals.css berada di luar layer Tailwind, jadi font sans dipasang di span. */}
                  <span className="font-sans">{position}</span>
                </h3>
                <ul className="flex flex-col gap-3 w-full">
                  {people.map((member, memberIndex) => (
                    <li
                      key={`${member.name}-${memberIndex}`}
                      className="flex items-center gap-3 px-4 py-3 bg-white rounded-md border-l-4 border-primary-900 shadow-sm"
                    >
                      <MemberAvatar member={member} className="w-8 h-8 text-xs bg-primary-50" />
                      <span className="min-w-0 text-sm font-semibold text-gray-900 truncate">{member.name}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
      )}
    </ol>
  );
}

function Connector() {
  return <span aria-hidden="true" className="block w-0.5 h-10 bg-secondary" />;
}

function LeaderCard({ member, featured }: { member: PublicMember; featured: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 overflow-hidden text-center text-white rounded-xl border-t-4 border-secondary shadow-lg",
        "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,white_6%,transparent)_0_1px,transparent_1px_14px)]",
        featured ? "px-8 py-8 w-72 bg-primary-900" : "px-6 py-6 w-60 bg-primary-800",
      )}
    >
      <MemberAvatar
        member={member}
        className={cn("text-white bg-white/10 ring-1 ring-white/25", featured ? "w-14 h-14 text-base" : "w-12 h-12 text-sm")}
      />
      <div className="flex flex-col gap-1">
        <p className={cn("font-bold leading-snug", featured ? "text-xl" : "text-lg")}>{member.name}</p>
        <p className="text-sm font-semibold text-secondary">{member.position}</p>
      </div>
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
