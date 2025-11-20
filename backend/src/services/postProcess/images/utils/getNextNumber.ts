import { IImage } from '@/interfaces/interfaces.js';

export default function (images: IImage[]): number {
  const existingNumbers = images
    .map((img) => {
      const match = img.name?.match(/_(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  let nextNumber = existingNumbers.length > 0 ? existingNumbers.at(-1)! + 1 : 1;

  return nextNumber;
}
