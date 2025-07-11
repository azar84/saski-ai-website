const { PrismaClient } = require('@prisma/client');

async function fixCTATable() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgres://neondb_owner:npg_sJHvr0D5xhoi@ep-proud-king-a4o633cu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    }
  });

  try {
    console.log('🔍 Checking ctas table columns...');
    
    // Check which columns exist
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ctas' 
      AND table_schema = 'public';
    `;
    
    const existingColumns = columns.map(col => col.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Define required columns
    const requiredColumns = [
      { name: 'customId', type: 'TEXT' },
      { name: 'onClickEvent', type: 'TEXT' },
      { name: 'onHoverEvent', type: 'TEXT' },
      { name: 'onMouseOutEvent', type: 'TEXT' },
      { name: 'onFocusEvent', type: 'TEXT' },
      { name: 'onBlurEvent', type: 'TEXT' },
      { name: 'onKeyDownEvent', type: 'TEXT' },
      { name: 'onKeyUpEvent', type: 'TEXT' },
      { name: 'onTouchStartEvent', type: 'TEXT' },
      { name: 'onTouchEndEvent', type: 'TEXT' },
      { name: 'events', type: 'JSONB' }
    ];
    
    // Add missing columns
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Adding missing column: ${column.name}`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "ctas" ADD COLUMN "${column.name}" ${column.type};`);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`✅ Column already exists: ${column.name}`);
      }
    }
    
    console.log('🎉 CTA table check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCTATable(); 