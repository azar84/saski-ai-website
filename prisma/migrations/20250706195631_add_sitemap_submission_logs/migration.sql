-- CreateTable
CREATE TABLE "sitemap_submission_logs" (
    "id" TEXT NOT NULL,
    "sitemapUrl" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "searchEngine" TEXT NOT NULL,
    "googleResponse" TEXT,
    "errorMessage" TEXT,
    "statusCode" INTEGER,
    "submissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitemap_submission_logs_pkey" PRIMARY KEY ("id")
);
