/*
  Warnings:

  - You are about to drop the column `type` on the `GachaItems` table. All the data in the column will be lost.
  - You are about to drop the `Character` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_userId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_userId_fkey";

-- AlterTable
ALTER TABLE "GachaItems" DROP COLUMN "type";

-- DropTable
DROP TABLE "Character";

-- DropTable
DROP TABLE "Item";
