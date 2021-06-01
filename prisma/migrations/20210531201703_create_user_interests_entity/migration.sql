-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "UserInterests" (
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "relevance" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("userId","categoryId")
);

-- AddForeignKey
ALTER TABLE "UserInterests" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterests" ADD FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
