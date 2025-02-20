-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "itemId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_name_key" ON "Image"("name");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
