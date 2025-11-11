import { Prisma } from '@prisma/client';
import {
  IItem,
  IShortItem,
  ICategory,
  IShortStore,
  IShortEvent,
  IScraperItem,
  IUser,
  ICurrentPrice,
  IImage,
} from '@/interfaces/interfaces';
import prisma from '@/loaders/prisma';

// FUNCTIONS
export async function getItemById(id: number): Promise<IItem> {
  try {
    // Try to find item
    const item = await prisma.item.findUnique({
      where: { id, isActive: true },
      select: {
        name: true,
        model: true,
        brand: true,
        categories: {
          select: {
            name: true,
          },
        },
        subCategories: {
          select: {
            name: true,
          },
        },
        subSubCategories: {
          select: {
            name: true,
          },
        },
        images: {
          orderBy: {
            url: 'asc',
          },
          select: {
            url: true,
          },
        },
        description: true,
        stores: {
          select: {
            store: {
              select: {
                name: true,
                logo: true,
              },
            },
            url: true,
          },
        },
        isActive: true,
        searchCount: true,
      },
    });

    // console.log(item);

    // If item was not found
    if (!item) {
      throw new Error('Not found');
    }

    // If item was found add 1 to searchCount
    await prisma.item.update({
      where: { id },
      data: { searchCount: { increment: 1 } },
    });

    // Transform data
    const result: IItem = {
      name: item.name,
      model: item.model,
      brand: item.brand,
      categories: item.categories,
      subCategories: item.subCategories,
      subSubCategories: item.subSubCategories,
      images: item.images,
      description: item.description as Prisma.JsonObject,
      stores: item.stores.map((s) => ({
        name: s.store.name,
        logo: s.store.logo,
        url: s.url,
      })),
    };

    return result;
  } catch (err) {
    // Throw error to whoever called this
    // console.error(`Error fetching item ID=${id}:`, err);
    throw err;
  }
}

export async function getAllCategories(): Promise<ICategory[]> {
  try {
    // Try to find item
    const categories: ICategory[] = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        hasDepth: true,
        subCategories: {
          select: {
            id: true,
            name: true,
            hasDepth: true,
            subSubCategories: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If categories was not found
    if (!categories) {
      throw new Error('Not found');
    }

    // console.log(categories);

    return categories;
  } catch (err) {
    // Throw error to whoever called this
    // console.error('Error fetching categories:', err);
    throw err;
  }
}

export async function getImagesByItemIds(itemIds: number[]): Promise<IImage[]> {
  if (itemIds.length === 0) return [];

  try {
    // Try to find items
    const items = await prisma.item.findMany({
      where: { id: { in: itemIds }, isActive: true },
      include: {
        images: {
          select: { type: true, name: true, cloudinaryId: true, url: true },
        },
      },
      omit: {
        description: true,
        createdAt: true,
        updatedAt: true,
        searchCount: true,
      },
    });

    // console.log(items);

    // If item was not found
    if (items.length === 0) {
      throw new Error('Not found');
    }

    return items;
  } catch (err) {
    // Throw error to whoever called this
    // console.error(`Error fetching items:`, err);
    throw err;
  }
}

export async function getItemsByCategoryId(
  categoryId: number,
  pageSize: number,
  page: number
): Promise<IShortItem[]> {
  try {
    // Try to find item
    const items = await prisma.item.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        isActive: true,
        categories: {
          some: {
            id: categoryId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        model: true,
        brand: true,
        images: {
          where: {
            name: {
              contains: '1',
            },
          },
          orderBy: {
            name: 'asc',
          },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });

    // console.log(items);

    // If item was not found
    if (items.length === 0) {
      throw new Error('Not found');
    }

    // Transform data
    const result: IShortItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      model: item.model,
      brand: item.brand,
      images: item.images.length > 0 ? [item.images[0]] : [{ url: '' }],
    }));

    return result;
  } catch (err) {
    // Throw error to whoever called this
    // console.error(`Error fetching items:`, err);
    throw err;
  }
}

export async function getAllStores(): Promise<IShortStore[]> {
  try {
    // Try to find stores
    const stores: IShortStore[] = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
      },
    });

    // If store was not found
    if (!stores) {
      throw new Error('Not found');
    }

    // console.log(stores);

    return stores;
  } catch (err) {
    // Throw error to whoever called this
    // console.error('Error fetching stores:', err);
    throw err;
  }
}

export async function searchItemByString(
  query: string,
  pageSize: number,
  page: number
): Promise<IShortItem[]> {
  try {
    // Try to find item
    const items = await prisma.item.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        model: true,
        brand: true,
        images: {
          where: {
            name: {
              contains: '1',
            },
          },
          orderBy: {
            name: 'asc',
          },
          take: 1,
          select: {
            url: true,
          },
        },
        stores: {
          where: {
            events: { some: {} },
          },
          select: {
            events: {
              where: { status: 'OK' },
              orderBy: { price: 'asc' },
              take: 1,
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    // If item was not found
    if (items.length === 0) {
      return [];
    }

    // console.log(items);
    // console.log(items[0].stores);

    // Transform data
    const result: IShortItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      model: item.model,
      brand: item.brand,
      images: item.images.length > 0 ? [item.images[0]] : [{ url: '' }],
      price: item.stores[0].events[0].price,
    }));

    return result;
  } catch (err) {
    // Throw error to whoever called this
    // console.error('Error fetching items:', err);
    throw err;
  }
}

export async function getCurrentPricesByItemId(
  id: number
): Promise<ICurrentPrice> {
  try {
    // Try to find item
    const item = await prisma.item.findUnique({
      where: { id, isActive: true },
      select: {
        stores: {
          select: {
            store: {
              select: {
                name: true,
                logo: true,
              },
            },
            url: true,
            events: {
              orderBy: {
                date: 'desc',
              },
              take: 1,
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    // console.log(item);

    // If item was not found
    if (!item) {
      throw new Error('Not found');
    }

    // Transform data
    const result: ICurrentPrice = {
      stores: item.stores
        .map((s) => ({
          name: s.store.name,
          logo: s.store.logo,
          url: s.url,
          price: s.events[0]?.price || 0,
        }))
        .filter((store) => store.price > 0)
        .sort((a, b) => a.price - b.price),
    };

    return result;
  } catch (err) {
    // Throw error to whoever called this
    // console.error(`Error fetching item ID=${id}:`, err);
    throw err;
  }
}

export async function getLowestPricesByItemId(
  id: number,
  days: number
): Promise<IShortEvent[]> {
  const dateStartFilter = new Date();
  dateStartFilter.setHours(dateStartFilter.getHours() - 24 * days);

  try {
    const dailyLowestPrices = await prisma.$queryRaw<IShortEvent[]>`
      SELECT MIN(price) as price, DATE(date) as date
      FROM "Events"
      WHERE "itemId" = ${id} 
        AND date >= ${dateStartFilter}
        AND price > 0
      GROUP BY DATE(date)
      ORDER BY date ASC;
    `;

    // If item was not found
    if (dailyLowestPrices.length === 0) {
      throw new Error('Not found');
    }

    // console.log(dailyLowestPrices);

    // Transform data - Fill missing days
    let protection = 0;
    while (dailyLowestPrices.length < days) {
      const oldestDate = new Date(dailyLowestPrices[0].date);
      oldestDate.setDate(oldestDate.getDate() - 1); // Move one day back

      // Insert new entry at the beginning
      dailyLowestPrices.unshift({
        price: 0,
        date: oldestDate,
      });

      protection++;
      if (protection > 180) {
        break;
      }
    }

    return dailyLowestPrices;
  } catch (err) {
    // Throw error to whoever called this
    // console.error(`Error fetching item ID=${id}:`, err);
    throw err;
  }
}

export async function getAllItemsForScraper(): Promise<IScraperItem[]> {
  try {
    // Try to find item
    const item = await prisma.item.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        stores: {
          select: {
            store: {
              select: {
                id: true,
                name: true,
              },
            },
            url: true,
          },
        },
      },
    });

    // console.log(item);

    // Transform data
    const result: IScraperItem[] = item.map((item) => ({
      id: item.id,
      stores: item.stores.map((s) => ({
        id: s.store.id,
        name: s.store.name,
        url: s.url,
        price: 0,
      })),
    }));

    return result;
  } catch (err) {
    // Handle Error
    // console.error(`Error fetching all items:`, err);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  // This is exclusively used by middleware.verifyPassword
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        role: true,
      },
    });

    return user;
  } catch (err) {
    // Throw error to who called this
    throw err;
  }
}

export async function getUserById(id: string): Promise<IUser | null> {
  // This is exclusively used by middleware.attachCurrentUser
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        role: true,
      },
    });

    return user;
  } catch (err) {
    // Throw error to who called this
    throw err;
  }
}

export async function getItemDeals(qty: number): Promise<IShortItem[]> {
  try {
    // Try to get items
    const item = await prisma.item.findMany({
      take: qty,
      where: {
        isActive: true,
        stores: {
          some: {
            events: {
              some: {},
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        model: true,
        brand: true,
        images: {
          where: {
            name: {
              contains: '1',
            },
          },
          orderBy: {
            name: 'asc',
          },
          take: 1,
          select: {
            url: true,
          },
        },
        stores: {
          select: {
            store: {
              select: {
                name: true,
              },
            },
            events: {
              orderBy: { price: 'asc' },
              take: 1,
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    // console.log(item);
    // console.log(item[1].stores);
    // console.log(item[1].stores.map((store) => console.log(store.events)));

    // If no item was retrieved
    if (!item) {
      throw new Error('Not found');
    }

    // Transform data
    const result: IShortItem[] = item.map((item) => {
      const allPrices = item.stores.flatMap((store) => store.events[0].price);
      const lowestPrice = Math.min(...allPrices.filter((n) => n > 0));

      return {
        id: item.id,
        name: item.name,
        model: item.model,
        brand: item.brand,
        images: [{ url: item.images[0].url }],
        price: lowestPrice,
        storesQty: item.stores.filter((store) => store.events[0].price > 0)
          .length,
      };
    });

    return result;
  } catch (err) {
    // Throw error to whoever called this
    // console.error(`Error fetching items`, err);
    throw err;
  }
}
