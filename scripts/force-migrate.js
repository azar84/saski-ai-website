const { execSync } = require('child_process');

console.log('🔄 Force creating missing tables...');

// SQL to create the tables directly
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS "public"."service_account_credentials" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "privateKeyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authUri" TEXT NOT NULL,
    "tokenUri" TEXT NOT NULL,
    "authProviderX509CertUrl" TEXT NOT NULL,
    "clientX509CertUrl" TEXT NOT NULL,
    "universeDomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_account_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."sitemap_submission_logs" (
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
    "warnings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitemap_submission_logs_pkey" PRIMARY KEY ("id")
);

-- Add warnings column if it doesn't exist (for existing tables)
ALTER TABLE "public"."sitemap_submission_logs" 
ADD COLUMN IF NOT EXISTS "warnings" TEXT;
`;

try {
  console.log('📋 Creating tables directly...');
  execSync(`npx prisma db execute --schema prisma/schema.prisma --stdin`, { 
    input: createTablesSQL,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log('✅ Tables created successfully!');
} catch (error) {
  console.error('❌ Failed to create tables:', error.message);
  process.exit(1);
}

console.log('🎉 Force migration completed!'); 