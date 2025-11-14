/*
  Warnings:

  - A unique constraint covering the columns `[itemId,referenceUrl]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Image_itemId_referenceUrl_key" ON "Image"("itemId", "referenceUrl");
