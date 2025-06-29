/*
  Warnings:

  - You are about to drop the column `headerSectionId` on the `page_sections` table. All the data in the column will be lost.
  - You are about to drop the `header_sections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_sections" DROP CONSTRAINT "page_sections_headerSectionId_fkey";

-- AlterTable
ALTER TABLE "feature_groups" ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff';

-- AlterTable
ALTER TABLE "page_sections" DROP COLUMN "headerSectionId";

-- DropTable
DROP TABLE "header_sections";
