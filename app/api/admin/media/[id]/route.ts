import { serverClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { readIntent } from "@/lib/media/service";
import { protectedUrl } from "@/lib/media/cloudinary";
import { AppError, httpFailure, PRIVATE_HEADERS } from "@/lib/backend/errors";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(await serverClient(true));
    const intent = await readIntent(admin, (await params).id);
    if (intent.status !== "COMPLETED") throw new AppError("NOT_FOUND");
    const result = await fetch(protectedUrl(intent), {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    if (!result.ok) throw new AppError("SERVICE_UNAVAILABLE");
    const mime =
      intent.format === "pdf"
        ? "application/pdf"
        : intent.format === "jpg"
          ? "image/jpeg"
          : `image/${intent.format}`;
    return new Response(result.body, {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${intent.id}.${intent.format}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return httpFailure(error);
  }
}
