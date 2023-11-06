/*
  Warnings:

  - The `stage` column on the `Entry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EntryStage" AS ENUM ('stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5', 'stage_6', 'stage_7', 'stage_7_plus', 'adult', 'preschool');

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "stage",
ADD COLUMN     "stage" "EntryStage"[];
