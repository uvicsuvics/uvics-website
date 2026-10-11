import { z } from "zod";
import { loginSchema } from "@/lib/backend/validation";
import { AppError } from "@/lib/backend/errors";
export type AdminIdentity = { id: string; sessionId: string; name: string };
export type LoginOperations = {
  limit(email: string): Promise<void>;
  authenticate(input: z.infer<typeof loginSchema>): Promise<void>;
  authorize(): Promise<AdminIdentity>;
  audit(): Promise<void>;
  revoke(): Promise<void>;
};
export async function loginAdmin(
  raw: unknown,
  operations: LoginOperations,
): Promise<AdminIdentity> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success)
    throw new AppError("VALIDATION_ERROR", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  await operations.limit(parsed.data.email);
  await operations.authenticate(parsed.data);
  try {
    const admin = await operations.authorize();
    await operations.audit();
    return admin;
  } catch (error) {
    try {
      await operations.revoke();
    } catch {
      console.error("auth.login_compensation_failed");
      throw new AppError("SERVICE_UNAVAILABLE");
    }
    if (
      error instanceof AppError &&
      ["FORBIDDEN", "UNAUTHENTICATED"].includes(error.code)
    )
      throw new AppError("INVALID_CREDENTIALS");
    throw error;
  }
}
