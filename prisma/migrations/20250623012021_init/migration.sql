-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
