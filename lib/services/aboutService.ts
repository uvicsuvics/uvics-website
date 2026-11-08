import {
  UVICS_ABOUT,
  UVICS_VISION_MISSION,
  type AboutContent,
  type VisionMissionContent,
} from "@/data/mock/about";

// Sumber data sementara: mock. Diganti konten Admin → Pages saat integrasi CMS.

export async function getAboutContent(): Promise<AboutContent> {
  return UVICS_ABOUT;
}

export async function getVisionMissionContent(): Promise<VisionMissionContent> {
  return UVICS_VISION_MISSION;
}
