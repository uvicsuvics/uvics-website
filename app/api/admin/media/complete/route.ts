import { serverClient } from "@/lib/supabase/server";
import { assertOrigin, readJson } from "@/lib/backend/request";
import { appOrigin } from "@/lib/env/server";
import { httpFailure, PRIVATE_HEADERS } from "@/lib/backend/errors";
import { completeUpload } from "@/lib/media/service";
export async function POST(request: Request) {
  try {
    assertOrigin(request.headers.get("origin"), appOrigin());
    const body = await readJson(request);
    const data = await completeUpload(await serverClient(true), body);
    return Response.json({ ok: true, data }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    return httpFailure(error);
  }
}
