/*
  Warnings:

  - Added the required column `thumbUrl` to the `PostAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostAttachment" ADD COLUMN     "bgColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "thumbUrl" TEXT NOT NULL;
