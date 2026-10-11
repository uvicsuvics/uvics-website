import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(1024),
});
const positiveInteger = z
  .union([z.number(), z.string().regex(/^[1-9][0-9]*$/)])
  .pipe(
    z.coerce
      .number<string | number>()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER),
  );
export const paginationSchema = z
  .object({
    page: positiveInteger.default(1),
    page_size: positiveInteger.pipe(z.number().max(100)).default(20),
  })
  .refine((v) => (v.page - 1) * v.page_size <= Number.MAX_SAFE_INTEGER, {
    message: "Pagination di luar batas.",
  });
export const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/, {
    message: "Format tanggal harus YYYY-MM-DD.",
  })
  .refine(
    (val) => {
      const [year, month, day] = val.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    },
    { message: "Tanggal kalender tidak valid." },
  );
export function paginationMeta(
  page: number,
  page_size: number,
  total_items: number,
) {
  return {
    page,
    page_size,
    total_items,
    total_pages: Math.ceil(total_items / page_size),
  };
}
