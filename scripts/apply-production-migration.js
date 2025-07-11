const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function applyProductionMigration() {
  console.log('🔄 Applying production migration...');
  
  try {
    // Get the production database URL from Neon CLI
    console.log('📡 Fetching production database URL...');
    const dbUrl = execSync('neonctl db list --org-id org-lively-mud-54185015 --output json', { encoding: 'utf8' });
    const dbList = JSON.parse(dbUrl);
    
    // Find the preview database
    const previewDb = dbList.find(db => db.name === 'preview');
    if (!previewDb) {
      throw new Error('Preview database not found');
    }
    
    console.log('✅ Found preview database:', previewDb.name);
    
    // Set the DATABASE_URL environment variable
    process.env.DATABASE_URL = previewDb.connectionString;
    
    console.log('🔧 Running Prisma migration...');
    
    // Run the migration
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: previewDb.connectionString }
    });
    
    console.log('✅ Migration applied successfully!');
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: previewDb.connectionString }
    });
    
    console.log('✅ Prisma client generated successfully!');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

applyProductionMigration(); 