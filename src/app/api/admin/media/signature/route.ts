import { serverClient } from "@/src/lib/supabase/server";
import { assertOrigin, readJson } from "@/src/lib/backend/request";
import { appOrigin } from "@/src/lib/env/server";
import { httpFailure, PRIVATE_HEADERS } from "@/src/lib/backend/errors";
import { createSignedUpload } from "@/src/lib/media/service";
export async function POST(request: Request) {
  try {
    assertOrigin(request.headers.get("origin"), appOrigin());
    const body = await readJson(request);
    const data = await createSignedUpload(await serverClient(true), body);
    return Response.json(
      { ok: true, data },
      { status: 201, headers: PRIVATE_HEADERS },
    );
  } catch (error) {
    return httpFailure(error);
  }
}
