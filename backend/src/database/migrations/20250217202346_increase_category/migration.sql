/*
  Warnings:

  - You are about to drop the `ItemCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hasDepth` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ItemCategory" DROP CONSTRAINT "ItemCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ItemCategory" DROP CONSTRAINT "ItemCategory_itemId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "hasDepth" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "ItemCategory";

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hasDepth" BOOLEAN NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSubCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hasDepth" BOOLEAN NOT NULL DEFAULT false,
    "subCategoryId" INTEGER NOT NULL,

    CONSTRAINT "SubSubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemToSubCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ItemToSubCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ItemToSubSubCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ItemToSubSubCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryToItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_name_key" ON "SubCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubSubCategory_name_key" ON "SubSubCategory"("name");

-- CreateIndex
CREATE INDEX "_ItemToSubCategory_B_index" ON "_ItemToSubCategory"("B");

-- CreateIndex
CREATE INDEX "_ItemToSubSubCategory_B_index" ON "_ItemToSubSubCategory"("B");

-- CreateIndex
CREATE INDEX "_CategoryToItem_B_index" ON "_CategoryToItem"("B");

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSubCategory" ADD CONSTRAINT "SubSubCategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSubCategory" ADD CONSTRAINT "_ItemToSubCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSubCategory" ADD CONSTRAINT "_ItemToSubCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSubSubCategory" ADD CONSTRAINT "_ItemToSubSubCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSubSubCategory" ADD CONSTRAINT "_ItemToSubSubCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SubSubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToItem" ADD CONSTRAINT "_CategoryToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToItem" ADD CONSTRAINT "_CategoryToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
