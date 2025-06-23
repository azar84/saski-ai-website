-- CreateTable
CREATE TABLE "home_page_hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heading" TEXT NOT NULL DEFAULT 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
    "subheading" TEXT NOT NULL DEFAULT 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
    "primaryCtaText" TEXT NOT NULL DEFAULT 'Try Live Demo',
    "primaryCtaUrl" TEXT NOT NULL DEFAULT '#demo',
    "primaryCtaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "secondaryCtaText" TEXT NOT NULL DEFAULT 'Join Waitlist',
    "secondaryCtaUrl" TEXT NOT NULL DEFAULT '#waitlist',
    "secondaryCtaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trust_indicators" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homePageHeroId" INTEGER NOT NULL,
    "iconName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "trust_indicators_homePageHeroId_fkey" FOREIGN KEY ("homePageHeroId") REFERENCES "home_page_hero" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
