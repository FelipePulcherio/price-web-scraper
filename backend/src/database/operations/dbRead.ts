import { Prisma } from '@prisma/client';
import { IShortItem } from '@/interfaces/interfaces';
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
    const result: IShortItem = {
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
