import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '@/interfaces/interfaces';

const detachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    return next(error);
  }
};

export default detachCurrentUser;
