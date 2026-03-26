/*
  Warnings:

  - Added the required column `updatedAt` to the `JobLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobLog" ADD COLUMN     "result" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Pipeline" ADD COLUMN     "actionType" TEXT NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
