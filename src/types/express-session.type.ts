import { UserRole, UserStatus } from '@prisma/client';
import { Session } from 'express-session';

export interface ISession extends Session {
  clientId: string;
  role: UserRole;
  status: UserStatus;
}
