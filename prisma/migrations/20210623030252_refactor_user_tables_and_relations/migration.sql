/*
  Warnings:

  - You are about to drop the column `userId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isPublisher` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_EventFollowers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserFollows` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_authorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userId_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollowers" DROP CONSTRAINT "_EventFollowers_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollowers" DROP CONSTRAINT "_EventFollowers_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "userId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "seen" BOOLEAN DEFAULT false,
ADD COLUMN     "sentOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "date",
ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "respondedOn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPublisher",
DROP COLUMN "userId",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "theme" TEXT,
ADD COLUMN     "useDarkStyle" BOOLEAN,
ADD COLUMN     "verificationCode" INTEGER,
ADD COLUMN     "verificationLevel" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "userName" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- DropTable
DROP TABLE "_EventFollowers";

-- DropTable
DROP TABLE "_UserFollows";

-- CreateTable
CREATE TABLE "Publisher" (
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Follower" (
    "consumerId" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("consumerId","publisherId")
);

-- CreateTable
CREATE TABLE "Consumer" (
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userAId","userBId")
);

-- CreateTable
CREATE TABLE "_EventFollower" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventFollower_AB_unique" ON "_EventFollower"("A", "B");

-- CreateIndex
CREATE INDEX "_EventFollower_B_index" ON "_EventFollower"("B");

-- AddForeignKey
ALTER TABLE "Publisher" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD FOREIGN KEY ("consumerId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD FOREIGN KEY ("publisherId") REFERENCES "Publisher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumer" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD FOREIGN KEY ("userAId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD FOREIGN KEY ("userBId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("authorId") REFERENCES "Publisher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollower" ADD FOREIGN KEY ("A") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollower" ADD FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
