import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function validateSignup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateSignin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    signinSchema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
}
