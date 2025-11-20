/*
  Warnings:

  - You are about to drop the column `url` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "url",
ADD COLUMN     "cloudinaryUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "referenceUrl" TEXT NOT NULL DEFAULT '';
