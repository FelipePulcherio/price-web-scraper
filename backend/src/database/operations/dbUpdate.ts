import prisma from '../../loaders/prisma.js';
import { IImage } from '../../interfaces/interfaces.js';

// FUNCTIONS
export async function updateImageById(id: number, data: IImage): Promise<void> {
  await prisma.image.update({
    where: { id },
    data,
  });
}
