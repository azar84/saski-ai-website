const { PrismaClient } = require('@prisma/client');

async function createGlobalFunctionsTable() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgres://neondb_owner:npg_sJHvr0D5xhoi@ep-proud-king-a4o633cu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    }
  });

  try {
    console.log('🔍 Checking if global_functions table exists...');
    
    // Try to query the table to see if it exists
    try {
      const result = await prisma.$queryRaw`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'global_functions'
      );`;
      
      const tableExists = result[0].exists;
      
      if (tableExists) {
        console.log('✅ global_functions table already exists');
      } else {
        console.log('❌ global_functions table does not exist, creating it...');
        
        // Create the table
        await prisma.$executeRaw`
          CREATE TABLE "global_functions" (
            "id" SERIAL PRIMARY KEY,
            "functionName" TEXT NOT NULL,
            "functionCode" TEXT NOT NULL,
            "description" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
          );
        `;
        
        console.log('✅ global_functions table created successfully');
      }
      
    } catch (error) {
      console.log('❌ Error checking table:', error.message);
      console.log('🛠️ Attempting to create table...');
      
      // Try to create the table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "global_functions" (
          "id" SERIAL PRIMARY KEY,
          "functionName" TEXT NOT NULL,
          "functionCode" TEXT NOT NULL,
          "description" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        );
      `;
      
      console.log('✅ global_functions table created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createGlobalFunctionsTable(); 