-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_home_page_hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heading" TEXT NOT NULL DEFAULT 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
    "subheading" TEXT NOT NULL DEFAULT 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
    "primaryCtaText" TEXT NOT NULL DEFAULT 'Try Live Demo',
    "primaryCtaUrl" TEXT NOT NULL DEFAULT '#demo',
    "primaryCtaIcon" TEXT NOT NULL DEFAULT 'Play',
    "primaryCtaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "secondaryCtaText" TEXT NOT NULL DEFAULT 'Join Waitlist',
    "secondaryCtaUrl" TEXT NOT NULL DEFAULT '#waitlist',
    "secondaryCtaIcon" TEXT NOT NULL DEFAULT 'Users',
    "secondaryCtaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_home_page_hero" ("createdAt", "heading", "id", "isActive", "primaryCtaEnabled", "primaryCtaText", "primaryCtaUrl", "secondaryCtaEnabled", "secondaryCtaText", "secondaryCtaUrl", "subheading", "updatedAt") SELECT "createdAt", "heading", "id", "isActive", "primaryCtaEnabled", "primaryCtaText", "primaryCtaUrl", "secondaryCtaEnabled", "secondaryCtaText", "secondaryCtaUrl", "subheading", "updatedAt" FROM "home_page_hero";
DROP TABLE "home_page_hero";
ALTER TABLE "new_home_page_hero" RENAME TO "home_page_hero";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
