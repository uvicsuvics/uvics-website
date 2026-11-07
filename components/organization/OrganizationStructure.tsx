"use client";

import { useState } from "react";
import { MemberCard } from "@/components/organization/MemberCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PublicMember } from "@/lib/backend/dto";
import type { OrganizationPeriodItem } from "@/lib/services/organizationService";
import { cn } from "@/lib/utils";

interface OrganizationStructureProps {
  periods: OrganizationPeriodItem[];
  membersByPeriod: Record<string, PublicMember[]>;
  /** Periode ACTIVE, ditentukan di server. */
  defaultPeriodId: string;
  periodLabel: string;
  emptyMessage: string;
}

/**
 * Pemilih periode dan pengurus per departemen untuk periode yang dipilih.
 */
export function OrganizationStructure({
  periods,
  membersByPeriod,
  defaultPeriodId,
  periodLabel,
  emptyMessage,
}: OrganizationStructureProps) {
  const [periodId, setPeriodId] = useState(defaultPeriodId);

  // Urutan grup mengikuti baris pertama tiap departemen, sehingga Pengurus Inti tampil lebih dulu.
  // Kunci null = core team tanpa departemen (U01), tampil tanpa judul departemen.
  const groups = new Map<string | null, PublicMember[]>();
  for (const member of membersByPeriod[periodId] ?? []) {
    groups.set(member.department, [...(groups.get(member.department) ?? []), member]);
  }

  return (
    <div className="flex flex-col gap-10">
      <div role="group" aria-label={periodLabel} className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            aria-pressed={period.id === periodId}
            onClick={() => setPeriodId(period.id)}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              period.id === periodId
                ? "text-white bg-primary border-primary"
                : "text-gray-700 bg-white border-gray-200 hover:text-primary hover:border-primary-300",
            )}
          >
            {period.name}
          </button>
        ))}
      </div>

      {groups.size === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        [...groups].map(([department, members]) => (
          <div key={department ?? ""} className="flex flex-col gap-4">
            {department && <h3 className="font-heading text-xl font-bold text-gray-900">{department}</h3>}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <li key={`${member.name}-${member.position}`}>
                  <MemberCard member={member} />
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
