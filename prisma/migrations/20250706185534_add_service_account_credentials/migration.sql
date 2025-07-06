-- CreateTable
CREATE TABLE "service_account_credentials" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_account_credentials_pkey" PRIMARY KEY ("id")
);
