-- AlterTable
ALTER TABLE "page_sections" ADD COLUMN     "headerSectionId" INTEGER;

-- CreateTable
CREATE TABLE "header_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "menuTextColor" TEXT DEFAULT '#374151',
    "menuHoverColor" TEXT DEFAULT '#5243E9',
    "menuActiveColor" TEXT DEFAULT '#5243E9',
    "isSticky" BOOLEAN NOT NULL DEFAULT true,
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "showNavigation" BOOLEAN NOT NULL DEFAULT true,
    "showCTAs" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_sections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_headerSectionId_fkey" FOREIGN KEY ("headerSectionId") REFERENCES "header_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
