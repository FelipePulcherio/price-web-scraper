-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('THUMBNAIL', 'CAROUSEL');

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "type" "ImageType" NOT NULL DEFAULT 'CAROUSEL';
