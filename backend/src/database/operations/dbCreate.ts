import { Prisma } from '@prisma/client';
import { IUser, IShortUser } from '@/interfaces/interfaces';
import prisma from '@/loaders/prisma';

// FUNCTIONS
export async function createUser(data: IUser): Promise<IShortUser | undefined> {
  try {
    const { firstName, lastName, userName, email, phone, password } = data;

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        userName,
        email,
        phone,
        password,
        updatedById: '01010101-ffff-1111-ffff-010101010101',
      },
    });

    return { userName: newUser.userName, email: newUser.email };
  } catch (error) {
    // Throw error to whoever called this
    // Handle errors from Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint error (userName and email)
      if (error.code === 'P2002') {
        throw new Error(`${error.meta?.target} already in use.`);
      }
    }
    // All other errors
    else {
      console.error('Error creating user:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error.'
      );
    }
  }
}
