/*
  Warnings:

  - You are about to drop the column `verficationLevel` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verficationLevel",
ADD COLUMN     "verificationLevel" INTEGER NOT NULL DEFAULT 0;
