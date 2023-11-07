import {
  EntryStroke,
  EntryType,
  EntryStage,
  ContentStatus,
} from '@prisma/client';

export type EntryObject = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  author: string;
  type: EntryType;
  created_on: Date;
  updated_on?: Date;
  teaching_points: string[];
  stroke: EntryStroke;
  stage: EntryStage;
};

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
