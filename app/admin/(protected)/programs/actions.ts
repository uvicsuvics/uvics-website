"use server";
import { mutate } from "@/lib/admin/server";
import {
  archiveProgram,
  createProgram,
  publishProgram,
  updateProgram,
} from "@/lib/backend/programs";

const PATH = "/admin/programs";

export async function createProgramAction(input: unknown) {
  return mutate(PATH, async (client) => ({
    id: (await createProgram(client, input)).id,
  }));
}

export async function updateProgramAction(id: string, input: unknown) {
  return mutate(PATH, async (client) => {
    await updateProgram(client, id, input);
    return null;
  });
}

export async function publishProgramAction(id: string) {
  return mutate(PATH, async (client) => {
    await publishProgram(client, id);
    return null;
  });
}

export async function archiveProgramAction(id: string) {
  return mutate(PATH, async (client) => {
    await archiveProgram(client, id);
    return null;
  });
}
