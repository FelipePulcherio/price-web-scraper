import { Request, Response, NextFunction } from 'express';
import { IUser, IAuthUser } from '@/interfaces/interfaces';
import { getUserById } from '@/database/operations/dbRead';

const attachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let currentUser: IAuthUser;

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
  } catch (error) {
    return next(error);
  }
};

export default attachCurrentUser;
