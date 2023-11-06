import {
  EntryStroke,
  EntryType,
  EntryStage,
  ContentStatus,
} from '@prisma/client';

export type EntrySearchData = {
  title?: { contains: string; mode?: any };
  body?: { contains: string; mode?: any };
  author?: { contains: string; mode?: any };
  type?: EntryType;
  stroke?: EntryStroke;
  stage?: { hasEvery: EntryStage[] };
  status?: ContentStatus;
  page?: number;
  limit?: limit;
};
