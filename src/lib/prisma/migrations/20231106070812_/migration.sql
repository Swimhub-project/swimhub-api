/*
  Warnings:

  - Added the required column `body` to the `Entry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
