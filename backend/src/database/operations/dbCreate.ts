import { IUser, IDiscoverItem } from '@/interfaces/interfaces';
import prisma from '@/loaders/prisma';
import { Status } from '@prisma/client';
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
  } catch (err) {
    // Throw error to whoever called this
    throw err;
  }
}

export async function createEvent(
  items: IDiscoverItem[],
  fromJob: 'SCRAPER'
): Promise<void> {
  try {
    switch (fromJob) {
      case 'SCRAPER':
        // Filter items without id or storeId
        const eventsToCreate = items
          .filter((item) => item.id)
          .flatMap((item) =>
            item.stores
              .filter((store) => store.storeId)
              .map((store) => ({
                itemId: item.id!,
                storeId: store.storeId!,
                price: store.price!,
                date: new Date(),
                fromJob,
                status: Status.OK,
              }))
          );

        if (eventsToCreate.length === 0) return;

        // Save in DB
        await prisma.events.createMany({
          data: eventsToCreate,
          skipDuplicates: false,
        });

        break;

      default:
        throw new Error(`Unknown job type: ${fromJob}`);
    }
  } catch (err) {
    // Throw error to whoever called this
    console.error('Error creating events:', err);
    throw new Error(err instanceof Error ? err.message : 'Unknown error.');
  }
}
