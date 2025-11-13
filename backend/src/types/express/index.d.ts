import { AuthUser } from '../interfaces/interfaces.js';

declare global {
  namespace Express {
    export interface Request {
      currentUser?: AuthUser;
      token?: { id: string };
    }
  }
}
