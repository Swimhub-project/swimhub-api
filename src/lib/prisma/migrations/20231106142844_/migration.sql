/*
  Warnings:

  - You are about to drop the column `stage` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `test` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "stage",
DROP COLUMN "test";
