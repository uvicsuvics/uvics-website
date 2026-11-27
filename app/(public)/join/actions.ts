"use server";
import { headers } from "next/headers";
import { z } from "zod";
import {
  AppError,
  toFailure,
  type OperationResult,
} from "@/lib/backend/errors";
import { limitRegistration } from "@/lib/backend/rate-limit";
import { submitRegistration } from "@/lib/backend/registration";
import { assertOrigin, trustedIp } from "@/lib/backend/request";
import { appOrigin } from "@/lib/env/server";
import { serviceClient } from "@/lib/supabase/service";

const statusSchema = z.enum([
  "SUBMITTED",
  "CLOSED",
  "DUPLICATE",
  "INVALID_DEPARTMENT",
]);

/** Pendaftaran publik `/join`; endpoint POST publik, jadi semua pemeriksaan ada di sini. */
export async function submitRegistrationAction(
  input: unknown,
): Promise<OperationResult<null>> {
  try {
    const h = await headers();
    try {
      assertOrigin(h.get("origin"), appOrigin());
    } catch (error) {
      // proxy.ts tidak mencakup /join; log ini membedakan APP_ORIGIN salah dari pendaftaran tertutup.
      console.warn("registration.origin_rejected");
      throw error;
    }
    const ip = trustedIp(h, appOrigin(), process.env.VERCEL === "1");
    await submitRegistration(input, {
      limit: (email) => limitRegistration(email, ip),
      async submit(data) {
        const { data: status, error } = await serviceClient().rpc(
          "submit_registration",
          {
            p_full_name: data.full_name,
            p_nim: data.nim,
            p_email: data.email,
            p_phone: data.phone,
            p_faculty: data.faculty,
            p_study_program: data.study_program,
            p_batch: data.batch,
            p_preferred_department_id: data.preferred_department_id,
            p_skills: data.skills,
            p_experience: data.experience,
            p_motivation: data.motivation,
            p_portfolio_url: data.portfolio_url,
          },
        );
        const parsed = statusSchema.safeParse(status);
        if (error || !parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
        return parsed.data;
      },
    });
  } catch (error) {
    return toFailure(error);
  }
  return { ok: true, data: null };
}
