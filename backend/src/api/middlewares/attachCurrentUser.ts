import { Request, Response, NextFunction } from 'express';
import { IUser, IAuthUser } from '@/interfaces/interfaces';
import { getUserById } from '@/database/operations/dbRead';

const attachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.token) {
      return next(new Error('Unauthorized'));
    }

    const userRecord: IUser | null = await getUserById(req.token.id);

    if (!userRecord) {
      return next(new Error('Unauthorized'));
    }

    // Transform data
    const currentUser: IAuthUser = {
      id: userRecord.id || '',
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      email: userRecord.email,
      phone: userRecord.phone,
      role: userRecord.role || 'LOGGED_USER',
    };

    req.currentUser = currentUser;

    return next();
  } catch (e) {
    return next(e);
  }
};

export default attachCurrentUser;
