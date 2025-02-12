/*
  Warnings:

  - Added the required column `status` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OK', 'FAILED');

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "status" "Status" NOT NULL;
