-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FOOD', 'TRANSPORT', 'HOUSING', 'SHOPPING', 'SALARY', 'OTHER');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER';
