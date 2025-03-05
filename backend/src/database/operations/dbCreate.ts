import { IUser, IEvent } from '@/interfaces/interfaces';
import prisma from '@/loaders/prisma';
import bcrypt from 'bcrypt';

// FUNCTIONS
export async function createUser(data: IUser): Promise<IUser | undefined> {
  try {
    const { firstName, lastName, email, phone, password } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        updatedById: '01010101-ffff-1111-ffff-010101010101',
      },
    });

    return newUser;
  } catch (error) {
    // Throw error to whoever called this
    throw error;
  }
}

export async function createEvent(data: IEvent[]): Promise<void> {
  try {
    const events: IEvent[] = data;

    await prisma.events.createMany({
      data: events.map((event) => ({
        itemId: event.itemId!,
        storeId: event.storeId!,
        price: event.price,
        fromJob: event.fromJob,
        status: event.status,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    // Throw error to whoever called this
    console.error('Error creating events:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error.');
  }
}
