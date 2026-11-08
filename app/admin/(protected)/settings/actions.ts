"use server";
import { mutate } from "@/lib/admin/server";
import { updateWebsiteSettings } from "@/lib/backend/settings";

export async function updateSettingsAction(values: unknown) {
  return mutate("/admin/settings", async (client) => {
    await updateWebsiteSettings(client, values);
    return null;
  });
}
