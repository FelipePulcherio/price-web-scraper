import { Request, Response, NextFunction } from 'express';
import { IUser, AuthUser } from '../../interfaces/interfaces.js';
import { getUserById } from '../../database/operations/dbRead.js';

async function attachCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let currentUser: AuthUser;

    // User without a token
    if (!req.token) {
      currentUser = {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'REGULAR_USER',
      };

      req.currentUser = currentUser;
      return next();
    }

    // User with a token
    const userRecord: IUser | null = await getUserById(req.token.id);

    if (!userRecord) {
      return next(new Error('Unauthorized'));
    }

    // Transform data
    currentUser = {
      id: userRecord.id || '',
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      email: userRecord.email,
      phone: userRecord.phone,
      role: userRecord.role || 'LOGGED_USER',
    };

    req.currentUser = currentUser;

    return next();
  } catch (err) {
    return next(err);
  }
}

export default attachCurrentUser;
