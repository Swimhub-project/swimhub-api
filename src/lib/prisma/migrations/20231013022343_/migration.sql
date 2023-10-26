-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('unread', 'open', 'closed');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('public', 'private', 'deleted');

-- CreateEnum
CREATE TYPE "EntryStroke" AS ENUM ('frontcrawl', 'backcrawl', 'breastroke', 'butterfly', 'general');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('tip', 'exercise', 'lesson_plan');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'moderator', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('inactive', 'active', 'muted', 'banned', 'deleted', 'locked');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3),
    "is_teacher" BOOLEAN NOT NULL,
    "bio" TEXT NOT NULL,
    "is_bio_public" BOOLEAN NOT NULL,
    "moderator_notes" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "EntryType" NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL,
    "teaching_points" TEXT[],
    "stroke" "EntryStroke" NOT NULL,
    "stage" TEXT[],

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteEntry" (
    "user_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,

    CONSTRAINT "FavouriteEntry_pkey" PRIMARY KEY ("user_id","entry_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL,
    "updated_on" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL,
    "parent_comment_id" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reported_by_id" TEXT NOT NULL,
    "entry_id" TEXT,
    "comment_id" TEXT,
    "message" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3),
    "status" "TicketStatus" NOT NULL,
    "moderator_notes" JSONB NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Support_Ticket" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3),
    "status" "TicketStatus" NOT NULL,
    "moderator_notes" JSONB NOT NULL,

    CONSTRAINT "Support_Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_parent_comment_id_key" ON "Comment"("parent_comment_id");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteEntry" ADD CONSTRAINT "FavouriteEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteEntry" ADD CONSTRAINT "FavouriteEntry_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support_Ticket" ADD CONSTRAINT "Support_Ticket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
