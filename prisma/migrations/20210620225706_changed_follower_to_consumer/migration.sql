/*
  Warnings:

  - You are about to drop the column `date` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `Follower` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FriendRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FriendShip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PublisherFollows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_userId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollower" DROP CONSTRAINT "_EventFollower_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollower" DROP CONSTRAINT "_EventFollower_B_fkey";

-- DropForeignKey
ALTER TABLE "_FriendShip" DROP CONSTRAINT "_FriendShip_A_fkey";

-- DropForeignKey
ALTER TABLE "_FriendShip" DROP CONSTRAINT "_FriendShip_B_fkey";

-- DropForeignKey
ALTER TABLE "_PublisherFollows" DROP CONSTRAINT "_PublisherFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_PublisherFollows" DROP CONSTRAINT "_PublisherFollows_B_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "date",
ADD COLUMN     "dateResponded" TIMESTAMP(3);

-- DropTable
DROP TABLE "Follower";

-- DropTable
DROP TABLE "FriendRequest";

-- DropTable
DROP TABLE "_FriendShip";

-- DropTable
DROP TABLE "_PublisherFollows";

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
    "updateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userAId","userBId")
);

-- CreateTable
CREATE TABLE "_Follower" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Follower_AB_unique" ON "_Follower"("A", "B");

-- CreateIndex
CREATE INDEX "_Follower_B_index" ON "_Follower"("B");

-- AddForeignKey
ALTER TABLE "Consumer" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD FOREIGN KEY ("userAId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD FOREIGN KEY ("userBId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Follower" ADD FOREIGN KEY ("A") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Follower" ADD FOREIGN KEY ("B") REFERENCES "Publisher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollower" ADD FOREIGN KEY ("A") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollower" ADD FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
