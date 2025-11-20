import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { getUserByEmail } from '../../database/operations/dbRead.js';

async function verifyPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return next(new Error('Invalid email or password'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new Error('Invalid email or password'));
    }

    // Transform data
    const currentUser = {
      id: user.id || '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role || 'LOGGED_USER',
    };

    req.currentUser = currentUser;

    next();
  } catch (err) {
    next(err);
  }
}

export default verifyPassword;
