import { Constants, type Enums } from '@/types/database';

export type ContentStatus = Enums<'content_status'>;

/** Kode status konten CMS yang valid, dipakai UI tanpa mengimpor `@/types/database`. */
export const CONTENT_STATUSES = Constants.public.Enums.content_status;
