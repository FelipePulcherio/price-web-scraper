import { IUser, IDiscoverItem, IImage } from '../../interfaces/interfaces.js';
import prisma from '../../loaders/prisma.js';
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

export async function createOrUpdateDiscoveredItems(
  discoveredItems: IDiscoverItem[]
): Promise<IDiscoverItem[]> {
  const createdOrUpdatedItems: IDiscoverItem[] = [];

  // PART 1
  // 1) Split into usable and unusable groups
  const itemsWithModels = discoveredItems.filter((i) => i.model);
  const itemsWithoutModels = discoveredItems.filter((i) => !i.model);

  // 2) Collect all models
  const models = itemsWithModels.map((i) => i.model!);

  // 3) Fetch all items that has model in DB
  const existingItems = await prisma.item.findMany({
    where: { model: { in: models } },
    include: {
      images: { select: { referenceUrl: true } },
      categories: { select: { id: true } },
      subCategories: { select: { id: true } },
      subSubCategories: { select: { id: true } },
    },
  });

  // 4) Index by model for quick lookup
  const existingByModel = new Map(existingItems.map((i) => [i.model, i]));

  // 5) Split into Update and Create
  const toUpdate: IDiscoverItem[] = [];
  const toCreate: IDiscoverItem[] = [];

  for (const item of itemsWithModels) {
    const existingId = existingByModel.get(item.model!);
    if (existingId) {
      toUpdate.push({ ...item, id: existingId.id });
    } else {
      toCreate.push(item);
    }
  }

  // 6): Bulk UPDATE (No connections)
  let updated: { id: number; name: string; model: string }[] = [];
  if (toUpdate.length > 0) {
    updated = await prisma.item.updateManyAndReturn({
      where: { id: { in: toUpdate.map((i) => i.id!) } },
      data: {
        updatedAt: new Date(),
      },
      select: { id: true, name: true, model: true },
    });
  }

  // 7) Bulk CREATE (No connections)
  let created: { id: number; name: string; model: string }[] = [];
  if (toCreate.length > 0) {
    created = await prisma.item.createManyAndReturn({
      data: toCreate.map((item) => ({
        name: item.name,
        model: item.model!,
        brand: item.brand ?? '',
      })),
      select: { id: true, name: true, model: true },
    });
  }

  const allCreatedOrUpdated = [...updated, ...created];

  // PART 2
  // 1) Build relation insert arrays
  // 1.1) Stores
  const storeLinks: {
    itemId: number;
    storeId: number;
    url: string;
    specificId: string;
  }[] = [];

  for (const item of itemsWithModels) {
    const itemId = allCreatedOrUpdated.find((x) => x.name === item.name)?.id;
    if (!itemId) continue;

    item.stores?.forEach((s) => {
      if (s.storeId) {
        storeLinks.push({
          itemId,
          storeId: s.storeId,
          url: s.url,
          specificId: s.specificId ?? '',
        });
      }
    });
  }

  // 1.2) Images
  const itemsWithoutImages = itemsWithModels.filter((i) => i.images);

  const imageLinks: {
    itemId: number;
    referenceUrl: string;
    name: string;
  }[] = [];

  for (const item of itemsWithoutImages) {
    const itemId = allCreatedOrUpdated.find((x) => x.name === item.name)?.id;
    if (!itemId) continue;

    item.images?.forEach((img) => {
      if (img.referenceUrl) {
        imageLinks.push({
          name: img.name!,
          referenceUrl: img.referenceUrl,
          itemId,
        });
      }
    });
  }

  // 2) Bulk CREATE connections
  // 2.1) Stores
  if (storeLinks.length > 0) {
    await prisma.itemStore.createMany({
      data: storeLinks,
      skipDuplicates: true,
    });
  }

  // 2.2) Images
  if (imageLinks.length > 0) {
    await prisma.image.createMany({
      data: imageLinks,
      skipDuplicates: true,
    });
  }

  // PART 3
  // Category has no explicit join table. FOR LOOP IS SLOW O(N).
  // Once it's solved we could use 'PART 2' strategy.
  // 1) Category connection. If categories are undefined it will not create connections.
  for (const item of itemsWithModels) {
    const updateData: any = {};

    if (
      item.categories &&
      item.categories.length > 0 &&
      existingByModel.get(item.model!)?.categories.length === undefined
    ) {
      updateData.categories = {
        connect: item.categories.map((c) => ({ name: c.name })),
      };
    }

    if (
      item.subCategories &&
      item.subCategories.length > 0 &&
      existingByModel.get(item.model!)?.subCategories.length === undefined
    ) {
      updateData.subCategories = {
        connect: item.subCategories.map((sc) => ({ name: sc.name })),
      };
    }

    if (
      item.subSubCategories &&
      item.subSubCategories.length > 0 &&
      existingByModel.get(item.model!)?.subSubCategories.length === undefined
    ) {
      updateData.subSubCategories = {
        connect: item.subSubCategories.map((ssc) => ({ name: ssc.name })),
      };
    }

    const itemId = allCreatedOrUpdated.find((i) => i.model === item.model)!.id;

    // console.log(
    //   `ID: ${itemId} | Item: ${item.name.slice(0, 8)} | C: ${
    //     item.categories
    //   } | SC: ${item.subCategories} | SSC: ${item.subSubCategories}`
    // );

    await prisma.item.update({
      where: {
        id: itemId,
      },
      data: updateData,
    });
  }

  // PART 4
  // Return items created or updated
  return itemsWithModels.map((item) => {
    const id = allCreatedOrUpdated.find((x) => x.name === item.name)?.id;
    return { ...item, id };
  });
}

export async function createImageAndConnectToItem(data: IImage): Promise<void> {
  const image = await prisma.image.create({
    data: {
      type: data.type,
      name: data.name!,
      cloudinaryId: data.cloudinaryId,
      cloudinaryUrl: data.cloudinaryUrl!.replace(
        'f_auto,q_auto/',
        'f_auto,q_auto/w_150,h_150/'
      ),
      referenceUrl: data.referenceUrl,
      Item: { connect: { id: data.itemId } },
    },
  });
}
