import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const signupSchema = z.strictObject({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
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

const signinSchema = z.strictObject({
  email: z.string().email(),
  password: z.string(),
});

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

const searchSchema = z.strictObject({
  q: z.string().min(1),
  page: z.string().min(1).optional(),
});

export function validateSearch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    searchSchema.parse(req.query);
    next();
  } catch (err) {
    next(err);
  }
}
