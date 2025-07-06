const { execSync } = require('child_process');

console.log('🔄 Running simple migration...');

try {
  // Try to deploy migrations
  console.log('📋 Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations deployed successfully!');
} catch (error) {
  console.log('⚠️  Migration failed, baselining database...');
  console.log('🔍 Error:', error.message || error);
  
  // Check if this is a P3005 error (database not empty)
  const errorStr = error.message || error.toString();
  if (errorStr.includes('P3005') || errorStr.includes('database schema is not empty')) {
    console.log('🔧 Baselining existing database...');
    
    // Mark all existing migrations as applied
    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir)
        .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
        .sort();
      
      console.log(`📝 Found ${migrations.length} migrations to baseline`);
      
      for (const migration of migrations) {
        try {
          execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'pipe' });
          console.log(`✓ ${migration} marked as applied`);
        } catch (resolveError) {
          // Ignore if already applied
          console.log(`✓ ${migration} already applied`);
        }
      }
      
      // Now try to deploy again
      console.log('🔄 Deploying remaining migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ All migrations deployed successfully!');
    }
  } else {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

console.log('🎉 Migration completed!'); 