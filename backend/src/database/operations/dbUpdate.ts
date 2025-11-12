import { Prisma } from '@prisma/client';
import prisma from '@/loaders/prisma';
import { IImage, IItem } from '@/interfaces/interfaces';

// FUNCTIONS
export async function updateImageById(id: number, data: IImage): Promise<void> {
  await prisma.image.update({
    where: { id },
    data,
  });
}
