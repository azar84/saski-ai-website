-- CreateTable
CREATE TABLE "header_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "header_nav_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "headerConfigId" INTEGER NOT NULL,
    "pageId" INTEGER,
    "customText" TEXT,
    "customUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "header_nav_items_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "header_nav_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cta_buttons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "style" TEXT NOT NULL DEFAULT 'primary',
    "target" TEXT NOT NULL DEFAULT '_self',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "header_cta_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "headerConfigId" INTEGER NOT NULL,
    "ctaId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "header_cta_items_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "header_cta_items_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "cta_buttons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
