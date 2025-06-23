-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_pages" ("createdAt", "id", "metaDesc", "metaTitle", "slug", "title", "updatedAt") SELECT "createdAt", "id", "metaDesc", "metaTitle", "slug", "title", "updatedAt" FROM "pages";
DROP TABLE "pages";
ALTER TABLE "new_pages" RENAME TO "pages";
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
