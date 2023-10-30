import { Prisma, UserRole, UserStatus } from '@prisma/client';

export type ModeratorNote = {
  id: string;
  content: string;
  created_on: Date;
  created_by_id: string;
};

export type UserObjectAdmin = {
  id: string;
  name: string;
  user_name?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_on: Date;
  updated_on?: Date;
  is_teacher: boolean;
  bio: string;
  is_bio_public: boolean;
  moderator_notes: ModeratorNote[];
};

export type UserObjectStripped = {
  id: string;
  name: string;
  user_name?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_teacher: boolean;
  bio: string;
  is_bio_public: boolean;
};

export type UserSearchData = {
  name?: { contains: string; mode?: any };
  user_name?: { contains: string; mode?: any };
  email?: { contains: string; mode?: any };
  role?: UserRole;
  status?: UserStatus;
  is_teacher?: boolean;
  is_bio_public?: boolean;
};
