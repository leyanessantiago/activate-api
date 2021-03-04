/*
  Warnings:

  - You are about to drop the column `isPublisher` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_UserFollows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_authorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userId_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollowers" DROP CONSTRAINT "_EventFollowers_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPublisher",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "Publisher" (
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Follower" (
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "_PublisherFollows" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FriendShip" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- DropTable
DROP TABLE "_UserFollows";

-- CreateIndex
CREATE UNIQUE INDEX "_PublisherFollows_AB_unique" ON "_PublisherFollows"("A", "B");

-- CreateIndex
CREATE INDEX "_PublisherFollows_B_index" ON "_PublisherFollows"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FriendShip_AB_unique" ON "_FriendShip"("A", "B");

-- CreateIndex
CREATE INDEX "_FriendShip_B_index" ON "_FriendShip"("B");

-- AddForeignKey
ALTER TABLE "Publisher" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublisherFollows" ADD FOREIGN KEY ("A") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublisherFollows" ADD FOREIGN KEY ("B") REFERENCES "Publisher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendShip" ADD FOREIGN KEY ("A") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendShip" ADD FOREIGN KEY ("B") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("authorId") REFERENCES "Publisher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollowers" ADD FOREIGN KEY ("B") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
