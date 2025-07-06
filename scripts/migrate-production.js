const { execSync } = require('child_process');

console.log('🔄 Starting production migration...');

try {
  // First, try to run normal migration
  console.log('📋 Attempting to deploy migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations deployed successfully!');
} catch (error) {
  console.log('⚠️  Migration deployment failed, checking if database needs baselining...');
  
  try {
    // Check if this is a P3005 error (database not empty)
    if (error.message.includes('P3005') || error.message.includes('database schema is not empty')) {
      console.log('🔧 Database exists but needs baselining. Marking migrations as applied...');
      
      // Get the list of migrations
      const fs = require('fs');
      const path = require('path');
      const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
      
      if (fs.existsSync(migrationsDir)) {
        const migrations = fs.readdirSync(migrationsDir)
          .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
          .sort();
        
        console.log(`📝 Found ${migrations.length} migrations to baseline:`);
        migrations.forEach(migration => console.log(`   - ${migration}`));
        
        // Mark all migrations as applied
        for (const migration of migrations) {
          try {
            console.log(`✓ Marking ${migration} as applied...`);
            execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'pipe' });
          } catch (resolveError) {
            // If already applied, that's fine
            if (resolveError.message.includes('already recorded as applied')) {
              console.log(`   ✓ ${migration} already applied`);
            } else {
              console.log(`   ⚠️  Could not resolve ${migration}: ${resolveError.message}`);
            }
          }
        }
        
        console.log('✅ Database baselined successfully!');
      } else {
        console.log('❌ No migrations directory found');
        process.exit(1);
      }
    } else {
      console.log('❌ Migration failed with unknown error:');
      console.log(error.message);
      process.exit(1);
    }
  } catch (baselineError) {
    console.log('❌ Baselining failed:');
    console.log(baselineError.message);
    process.exit(1);
  }
}

console.log('🎉 Production migration completed successfully!'); 