import { Request, Response, NextFunction } from 'express';
import resFormatter from '@/helpers/apiResponseFormatter';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export default function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default values
  let statusCode = 500;
  let messages: string[] = ['Internal server error'];

  // Handle Zod Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    messages = [];
    err.errors.map((error: any) => {
      messages.push(`${error.path.join('.')}: ${error.message}`);
    });
  }

  // Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint error
      statusCode = 409;
      messages = [`${err.meta?.target}: Already in use`];
    }
  }

  res.status(statusCode).json(resFormatter(false, messages, null));
}
