"use server";
import { mutate } from "@/lib/admin/server";
import {
  archivePage,
  createPage,
  publishPage,
  updatePage,
} from "@/lib/backend/pages";

const PATH = "/admin/pages";

export async function createPageAction(input: unknown) {
  return mutate(PATH, async (client) => ({
    id: (await createPage(client, input)).id,
  }));
}

export async function updatePageAction(id: string, input: unknown) {
  return mutate(PATH, async (client) => {
    await updatePage(client, id, input);
    return null;
  });
}

export async function publishPageAction(id: string) {
  return mutate(PATH, async (client) => {
    await publishPage(client, id);
    return null;
  });
}

export async function archivePageAction(id: string) {
  return mutate(PATH, async (client) => {
    await archivePage(client, id);
    return null;
  });
}
