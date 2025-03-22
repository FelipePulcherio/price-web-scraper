import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '@/interfaces/interfaces';

async function detachCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const currentUser: AuthUser = {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'REGULAR_USER',
    };

    req.currentUser = currentUser;

    return next();
  } catch (err) {
    return next(err);
  }
}

export default detachCurrentUser;
