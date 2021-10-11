-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastName" VARCHAR(255),
ALTER COLUMN "password" DROP NOT NULL;
