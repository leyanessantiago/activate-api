/*
  Warnings:

  - You are about to drop the column `verficationCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verficationCode",
ADD COLUMN     "verificationCode" TEXT;
