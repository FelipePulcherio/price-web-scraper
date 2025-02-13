import { IUser, IShortUser, IEvent } from '@/interfaces/interfaces';
import prisma from '@/loaders/prisma';

// FUNCTIONS
export async function createUser(data: IUser): Promise<IShortUser | undefined> {
  try {
    const { firstName, lastName, email, phone, password } = data;

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password,
        updatedById: '01010101-ffff-1111-ffff-010101010101',
      },
    });

    return { email: newUser.email };
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
