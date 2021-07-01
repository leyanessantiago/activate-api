/*
  Warnings:

  - You are about to drop the `_EventFollower` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventFollower" DROP CONSTRAINT "_EventFollower_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventFollower" DROP CONSTRAINT "_EventFollower_B_fkey";

-- DropTable
DROP TABLE "_EventFollower";

-- CreateTable
CREATE TABLE "EventFollower" (
    "consumerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    PRIMARY KEY ("consumerId","eventId")
);

-- AddForeignKey
ALTER TABLE "EventFollower" ADD FOREIGN KEY ("consumerId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFollower" ADD FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
