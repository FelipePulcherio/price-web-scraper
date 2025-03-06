import { AuthUser } from '@/interfaces/interfaces';

declare global {
  namespace Express {
    export interface Request {
      currentUser?: AuthUser;
      token?: { id: string };
    }
  }
}
