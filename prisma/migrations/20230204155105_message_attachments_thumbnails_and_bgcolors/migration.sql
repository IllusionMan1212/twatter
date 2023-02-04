/*
  Warnings:

  - You are about to drop the column `attachmentURL` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "attachmentURL";

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#000000',
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("messageId","url")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageAttachment_messageId_key" ON "MessageAttachment"("messageId");

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
