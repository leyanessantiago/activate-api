/*
  Warnings:

  - You are about to drop the column `content` on the `Activity` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "content",
ADD COLUMN     "eventId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
