import { PrismaClient } from '@prisma/client';
import {
  ITEMS_LIST,
  CATEGORIES_LIST,
  STORES_LIST,
  EVENTS_LIST,
  USERS_LIST,
} from './completeList';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Seeding function will follow a set of steps to clear and re-populate all tables
async function populateDB() {
  // STEP 1: Clear all tables
  console.log('Deleting all records...');

  await prisma.events.deleteMany({});
  await prisma.itemStore.deleteMany({});
  await prisma.itemCategory.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('All tables have been cleared.');

  // STEP 2: Find or Create categories
  console.log('Creating categories...');

  const createdCategories = await Promise.all(
    CATEGORIES_LIST.map(async (category) => {
      return prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: { name: category.name },
      });
    })
  );

  console.log('Created categories:', createdCategories);

  // STEP 3: Find or Create stores
  console.log('Creating stores...');

  const createdStores = await Promise.all(
    STORES_LIST.map(async (store) => {
      return prisma.store.upsert({
        where: { name: store.name },
        update: {},
        create: { name: store.name },
      });
    })
  );

  console.log('Created or Updated stores:', createdCategories);

  // STEP 4: Create Items and connect them to a Category (ItemCategory) and a Store (ItemStore) sequentially
  console.log('Creating items...');

  for (const item of ITEMS_LIST) {
    const createdItems = await prisma.item.create({
      data: {
        name: item.name,
        model: item.model,
        brand: item.brand,
        description: item.description,

        // Connect to a ItemCategory or create the category and then connect
        categories: {
          create: item.categories.map((category) => ({
            category: {
              connectOrCreate: {
                where: { name: category.name },
                create: { name: category.name },
              },
            },
          })),
        },

        // Connect to a ItemStore or create the store and then connect. Also add URL
        stores: {
          create: item.stores.map((store) => ({
            store: {
              connectOrCreate: {
                where: { name: store.name },
                create: { name: store.name },
              },
            },
            url: store.url,
          })),
        },
      },
    });

    console.log('Created items:', createdItems);
  }

  // STEP 5: Create events (Retrieving itemId + storeId first)
  console.log('Creating events...');

  async function createEvents() {
    await Promise.all(
      EVENTS_LIST.map(async (event) => {
        // Find itemId based on itemName
        const item = await prisma.item.findUnique({
          where: { name: event.itemName },
          select: { id: true },
        });

        if (!item) {
          console.warn(
            `Creation of events failed: Item "${event.itemName}" not found.`
          );
          return;
        }

        // Find storeId based on storeName
        const store = await prisma.store.findUnique({
          where: { name: event.storeName },
          select: { id: true },
        });

        if (!store) {
          console.warn(
            `Creation of events failed: store "${event.storeName}" not found.`
          );
          return;
        }

        // Create event with retrieved itemId and storeId
        const createdEvents = await prisma.events.create({
          data: {
            itemId: item.id,
            storeId: store.id,
            price: event.price,
            fromJob: event.fromJob,
            status: event.status,
          },
        });

        console.log('Created event:', createdEvents);
        return createEvents;
      })
    );
  }

  await createEvents();

  // STEP 6: Find or Create users
  console.log('Creating users...');

  let createdIds: string[] = [];
  for (const user of USERS_LIST) {
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Find or Create without specifying connection
    const result = await prisma.user.create({
      data: {
        id: user.id ?? undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        role: user.role,
        updatedById: undefined,
      },
    });

    createdIds.push(result.id);
  }

  // Specify the connection: SYSTEM created all new accounts
  const createdUser = await prisma.user.update({
    where: { id: '01010101-ffff-1111-ffff-010101010101' },
    data: {
      updatedUsers: {
        connect: createdIds.map((id) => ({ id })),
      },
    },
  });

  console.log('Created user:', createdUser);
}

populateDB()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
