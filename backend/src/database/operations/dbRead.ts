import { Prisma } from '@prisma/client';
import {
  IItem,
  IShortItem,
  ICategory,
  IShortStore,
} from '@/interfaces/interfaces';
import prisma from '@/loaders/prisma';

// FUNCTIONS
export async function getItemById(id: number): Promise<IShortItem> {
  try {
    // Try to find item
    const item = await prisma.item.findUnique({
      where: { id },
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

    console.log(item);

    // If item was not found
    if (!item) {
      throw new Error('Not found');
    }

    // If item was found and isActive = false
    if (!item.isActive) {
      throw new Error('Forbidden');
    }

    // If item was found and isActive = true
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

    console.log(items);

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

export async function searchItemQuick(query: string): Promise<IShortItem[]> {
  try {
    // Try to find item
    const items = await prisma.item.findMany({
      take: 5,
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

    console.log(items);

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
