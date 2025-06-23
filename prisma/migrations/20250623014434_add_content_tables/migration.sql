-- CreateTable
CREATE TABLE "pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hero_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "heading" TEXT,
    "subheading" TEXT,
    "imageUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hero_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "features" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "features_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "heading" TEXT,
    "subheading" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");
