import {
  BATCH_INFO_DATA,
  BATCH_MEMBERS_DATA,
  type BatchMember,
} from "@/src/data/batchData";
import { findById } from "@/src/services/utils/utils";

export type { BatchMember };
export type BatchInfo = (typeof BATCH_INFO_DATA)[string];

export type MemberFilter = {
  /** Contoh: "2024" */
  batchYear?: string;
  /** Contoh: "Web Development". Kosongkan atau isi "all" untuk semua bidang. */
  specialization?: string;
};

// SUMBER DATA: saat ini batchData.ts. Saat backend siap, ganti isi fungsi
// di bawah dengan fetch() dan biarkan signature-nya tetap.

export async function getMembers(
  filter: MemberFilter = {},
): Promise<BatchMember[]> {
  const { batchYear, specialization } = filter;
  return BATCH_MEMBERS_DATA.filter(
    (m) =>
      (!batchYear || m.batchYear === batchYear) &&
      (!specialization ||
        specialization === "all" ||
        m.specialization === specialization),
  );
}

export async function getMemberById(
  id: string | number,
): Promise<BatchMember | null> {
  return findById(BATCH_MEMBERS_DATA, id);
}

/** Lead angkatan; kalau tidak ada yang bertanda isLead, pakai member pertama. */
export async function getBatchLead(
  batchYear: string,
): Promise<BatchMember | null> {
  const members = await getMembers({ batchYear });
  return members.find((m) => m.isLead) ?? members[0] ?? null;
}

export async function getBatchInfo(
  batchYear: string,
): Promise<BatchInfo | null> {
  return BATCH_INFO_DATA[batchYear] ?? null;
}

/** Daftar tahun angkatan, terbaru dulu. Cocok untuk dropdown/filter. */
export async function getBatchYears(): Promise<string[]> {
  return Object.keys(BATCH_INFO_DATA).sort((a, b) => Number(b) - Number(a));
}

/** Daftar bidang yang ada di satu angkatan (atau semua angkatan). */
export async function getSpecializations(
  batchYear?: string,
): Promise<string[]> {
  const members = await getMembers({ batchYear });
  return Array.from(new Set(members.map((m) => m.specialization)));
}
