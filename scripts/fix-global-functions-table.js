const { PrismaClient } = require('@prisma/client');

async function fixGlobalFunctionsTable() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgres://neondb_owner:npg_sJHvr0D5xhoi@ep-proud-king-a4o633cu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    }
  });

  try {
    console.log('🔍 Checking global_functions table structure...');
    
    // Check which columns exist
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'global_functions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('Current columns:', columns);
    
    // Check if the table has the correct structure (matching Prisma schema)
    const expectedColumns = [
      'id', 'functions', 'createdAt', 'updatedAt'
    ];
    
    const existingColumns = columns.map(col => col.column_name);
    
    // If the table has wrong structure, drop and recreate it
    if (!expectedColumns.every(col => existingColumns.includes(col))) {
      console.log('❌ Table structure is incorrect, recreating...');
      
      // Drop the table
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "global_functions";`);
      
      // Create the table with correct structure (matching Prisma schema)
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "global_functions" (
          "id" SERIAL PRIMARY KEY,
          "functions" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        );
      `);
      
      console.log('✅ global_functions table recreated with correct structure');
    } else {
      console.log('✅ global_functions table structure is correct');
    }
    
    // Verify the table structure
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'global_functions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('Final table structure:', finalColumns);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixGlobalFunctionsTable(); 