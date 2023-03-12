-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('NudityOrSex', 'TerrorismOrViolence', 'Spam', 'Other');

-- CreateEnum
CREATE TYPE "ReportResolveReason" AS ENUM ('Invalid', 'Deleted');

-- CreateTable
CREATE TABLE "PostReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "comments" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolveReason" "ReportResolveReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostReport_postId_submitterId_key" ON "PostReport"("postId", "submitterId");

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
