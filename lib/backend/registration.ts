import { z } from "zod";
import { AppError } from "@/lib/backend/errors";
import {
  emailSchema,
  httpUrlSchema,
  phoneSchema,
} from "@/lib/backend/validation";

// Modul ini diimpor form client: jangan menambahkan import server-only.

export const DUPLICATE_REGISTRATION_MESSAGE =
  "NIM ini sudah memiliki pendaftaran yang sedang diproses.";
export const INACTIVE_DEPARTMENT_MESSAGE = "Departemen tidak tersedia.";

/** Identik dengan CHECK SQL `registrations.email` (`~*`); dijaga tests/unit/registration.test.ts. */
export const REGISTRATION_EMAIL_PATTERN =
  /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/i;

const messages = {
  full_name: "Nama lengkap wajib diisi, maksimal 120 karakter.",
  nim: "NIM wajib diisi, 5 sampai 20 karakter.",
  email: "Masukkan alamat email yang valid.",
  phone: "Masukkan nomor WhatsApp yang valid, misalnya 081234567890.",
  faculty: "Fakultas wajib diisi, 2 sampai 100 karakter.",
  study_program: "Program studi wajib diisi, 2 sampai 100 karakter.",
  batch: "Angkatan harus tahun antara 2000 dan tahun depan.",
  preferred_department_id: INACTIVE_DEPARTMENT_MESSAGE,
  skills: "Keahlian maksimal 1000 karakter.",
  experience: "Pengalaman maksimal 1000 karakter.",
  motivation: "Motivasi maksimal 2000 karakter.",
  portfolio_url: "Masukkan URL portofolio yang diawali http:// atau https://.",
  consent_data: "Persetujuan penggunaan data wajib dicentang.",
  consent_accuracy: "Konfirmasi kebenaran data wajib dicentang.",
};

function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => value || undefined);
}

/** Schema input pendaftaran publik, dipakai form (zodResolver) dan server. */
export const registrationSubmissionSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, messages.full_name)
      .max(120, messages.full_name),
    nim: z.string().trim().min(5, messages.nim).max(20, messages.nim),
    email: emailSchema.regex(REGISTRATION_EMAIL_PATTERN, messages.email),
    phone: phoneSchema,
    faculty: z
      .string()
      .trim()
      .min(2, messages.faculty)
      .max(100, messages.faculty),
    study_program: z
      .string()
      .trim()
      .min(2, messages.study_program)
      .max(100, messages.study_program),
    // Batas atas dinamis; SQL hanya menahan rentang statis 2000–2100.
    batch: z
      .number()
      .int(messages.batch)
      .min(2000, messages.batch)
      .refine(
        (value) => value <= new Date().getUTCFullYear() + 1,
        messages.batch,
      ),
    preferred_department_id: z
      .uuid(messages.preferred_department_id)
      .optional(),
    skills: optionalText(1000, messages.skills),
    experience: optionalText(1000, messages.experience),
    motivation: optionalText(2000, messages.motivation),
    // Input form yang dikosongkan bernilai "", yang ditolak httpUrlSchema.
    portfolio_url: z
      .union([z.literal(""), httpUrlSchema])
      .optional()
      .transform((value) => value || undefined),
    consent_data: z.literal(true, messages.consent_data),
    consent_accuracy: z.literal(true, messages.consent_accuracy),
  })
  .strict()
  // Persetujuan hanya syarat validasi; buktinya consent_at dari waktu database.
  // `void` menandai field sengaja dibuang tanpa lint-disable.
  .transform(({ consent_data, consent_accuracy, ...data }) => {
    void consent_data;
    void consent_accuracy;
    return data;
  });

export type RegistrationSubmissionInput = z.input<
  typeof registrationSubmissionSchema
>;
export type RegistrationSubmission = z.output<
  typeof registrationSubmissionSchema
>;
export type RegistrationStatus =
  "SUBMITTED" | "CLOSED" | "DUPLICATE" | "INVALID_DEPARTMENT";
export type RegistrationOperations = {
  limit(email: string): Promise<void>;
  submit(input: RegistrationSubmission): Promise<RegistrationStatus>;
};

export const REGISTRATION_FIELD_MESSAGES: Record<
  keyof RegistrationSubmissionInput,
  string
> = messages;

function isRegistrationField(
  key: unknown,
): key is keyof RegistrationSubmissionInput {
  return (
    typeof key === "string" && Object.hasOwn(REGISTRATION_FIELD_MESSAGES, key)
  );
}

/** Fallback pesan Indonesia untuk schema bersama yang tidak punya pesan sendiri. */
export const registrationErrorMap: z.core.$ZodErrorMap = (issue) => {
  const key = issue.path?.[0];
  return isRegistrationField(key)
    ? REGISTRATION_FIELD_MESSAGES[key]
    : "Periksa kembali data yang diisi.";
};

/**
 * Validasi, limiter, lalu RPC. Tidak ada data yang dikembalikan agar ID dan PII tidak bocor.
 * @param raw - Input tak tepercaya dari Server Action
 * @param operations - Limiter dan RPC yang disuntikkan (dapat diuji tanpa jaringan)
 */
export async function submitRegistration(
  raw: unknown,
  operations: RegistrationOperations,
): Promise<void> {
  const parsed = registrationSubmissionSchema.safeParse(raw, {
    error: registrationErrorMap,
  });
  if (!parsed.success)
    throw new AppError("VALIDATION_ERROR", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  await operations.limit(parsed.data.email);
  let status: RegistrationStatus;
  try {
    status = await operations.submit(parsed.data);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  switch (status) {
    case "SUBMITTED":
      return;
    case "CLOSED":
      throw new AppError("FORBIDDEN");
    case "DUPLICATE":
      throw new AppError("CONFLICT", {
        fieldErrors: { nim: [DUPLICATE_REGISTRATION_MESSAGE] },
      });
    case "INVALID_DEPARTMENT":
      throw new AppError("VALIDATION_ERROR", {
        fieldErrors: { preferred_department_id: [INACTIVE_DEPARTMENT_MESSAGE] },
      });
  }
}
