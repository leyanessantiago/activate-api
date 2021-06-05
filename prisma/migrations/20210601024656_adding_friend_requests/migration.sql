/*
  Warnings:

  - You are about to drop the `_EventFollowers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventFollowers" DROP CONSTRAINT "_EventFollowers_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollowers" DROP CONSTRAINT "_EventFollowers_B_fkey";

-- CreateTable
CREATE TABLE "FriendRequest" (
    "requestorId" TEXT NOT NULL,
    "requestedToId" TEXT NOT NULL,
    "dateSent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("requestorId","requestedToId")
);

-- CreateTable
CREATE TABLE "_EventFollower" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- DropTable
DROP TABLE "_EventFollowers";

-- CreateIndex
CREATE UNIQUE INDEX "_EventFollower_AB_unique" ON "_EventFollower"("A", "B");

-- CreateIndex
CREATE INDEX "_EventFollower_B_index" ON "_EventFollower"("B");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD FOREIGN KEY ("requestorId") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD FOREIGN KEY ("requestedToId") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollower" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFollower" ADD FOREIGN KEY ("B") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
