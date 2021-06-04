/*
  Warnings:

  - You are about to drop the column `userId` on the `Activity` table. All the data in the column will be lost.
  - The primary key for the `FriendRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `requestedToId` on the `FriendRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestorId` on the `FriendRequest` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_requestedToId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_requestorId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "userId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "dateSent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "seen" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_pkey",
DROP COLUMN "requestedToId",
DROP COLUMN "requestorId",
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD PRIMARY KEY ("creatorId", "receiverId");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD FOREIGN KEY ("creatorId") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD FOREIGN KEY ("receiverId") REFERENCES "Follower"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
