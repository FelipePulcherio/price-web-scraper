import { Request, Response, NextFunction } from 'express';
import { IAuthUser } from '@/interfaces/interfaces';

const detachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser: IAuthUser = {
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
