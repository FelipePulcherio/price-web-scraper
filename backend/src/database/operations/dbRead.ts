import { Prisma } from '@prisma/client';
import {
  IItem,
  IShortItem,
  ICategory,
  IShortStore,
  IShortEvent,
  IScraperItem,
  IUser,
  IShortUser,
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
            category: {
              select: {
                name: true,
              },
            },
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
      categories: item.categories.map((c) => ({ name: c.category.name })),
      description: item.description as Prisma.JsonObject,
      stores: item.stores.map((s) => ({
        name: s.store.name,
        logo: s.store.logo,
        url: s.url,
      })),
    };

    return result;
  } catch (error) {
    // Throw error to whoever called this
    // console.error(`Error fetching item ID=${id}:`, error);
    throw error;
  }
}

export async function getAllCategories(): Promise<ICategory[]> {
  try {
    // Try to find item
    const categories: ICategory[] = await prisma.category.findMany({});

    console.log(categories);

    // If item was not found
    if (!categories) {
      throw new Error('Not found');
    }

    return categories;
  } catch (error) {
    // Throw error to whoever called this
    // console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getItemsByCategoryId(
  categoryId: number,
  pageSize: number,
  page: number
): Promise<IShortItem[]> {
  try {
    // Try to find item
    const items: IShortItem[] = await prisma.item.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        isActive: true,
        categories: {
          some: {
            categoryId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        model: true,
        brand: true,
      },
    });

    // console.log(items);

    // If item was not found
    if (items.length === 0) {
      throw new Error('Not found');
    }

    return items;
  } catch (error) {
    // Throw error to whoever called this
    // console.error(`Error fetching items:`, error);
    throw error;
  }
}

export async function getAllStores(): Promise<IShortStore[]> {
  try {
    // Try to find store
    const stores: IShortStore[] = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
      },
    });

    console.log(stores);

    // If item was not found
    if (!stores) {
      throw new Error('Not found');
    }

    return stores;
  } catch (error) {
    // Throw error to whoever called this
    // console.error('Error fetching categories:', error);
    throw error;
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
        stores: {
          select: {
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

    // console.log(items);

    const result: IShortItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      model: item.model,
      brand: item.brand,
      price: item.stores[0].events[0].price,
    }));

    // If item was not found
    if (items.length === 0) {
      throw new Error('Not found');
    }

    return result;
  } catch (error) {
    // Throw error to whoever called this
    // console.error('Error fetching categories:', error);
    throw error;
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

    //console.log(dailyLowestPrices);

    // If item was not found
    if (dailyLowestPrices.length === 0) {
      throw new Error('Not found');
    }

    return dailyLowestPrices;
  } catch (error) {
    // Throw error to whoever called this
    // console.error(`Error fetching item ID=${id}:`, error);
    throw error;
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
  } catch (error) {
    // Handle Error
    // console.error(`Error fetching all items:`, error);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<IUser> {
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

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  } catch (error) {
    // Throw error to who called this
    throw error;
  }
}
