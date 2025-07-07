-- CreateTable
CREATE TABLE "script_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scriptType" TEXT NOT NULL DEFAULT 'javascript',
    "scriptContent" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "loadAsync" BOOLEAN NOT NULL DEFAULT false,
    "loadDefer" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "script_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "script_sections_name_key" ON "script_sections"("name");

-- AlterTable
ALTER TABLE "page_sections" ADD COLUMN "scriptSectionId" INTEGER;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_scriptSectionId_fkey" FOREIGN KEY ("scriptSectionId") REFERENCES "script_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE; 