const { execSync } = require('child_process');

console.log('🔄 Force creating service_account_credentials table...');

// SQL to create the table directly
const createTableSQL = `
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
`;

try {
  console.log('📋 Creating table directly...');
  execSync(`npx prisma db execute --stdin`, { 
    input: createTableSQL,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log('✅ Table created successfully!');
} catch (error) {
  console.error('❌ Failed to create table:', error.message);
  process.exit(1);
}

console.log('🎉 Force migration completed!'); 