const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addScriptSections() {
  try {
    console.log('🔄 Adding script_sections table...');
    
    // Create script_sections table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "script_sections" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "scriptType" TEXT NOT NULL DEFAULT 'javascript',
        "scriptContent" TEXT NOT NULL,
        "placement" TEXT NOT NULL DEFAULT 'footer',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "loadAsync" BOOLEAN NOT NULL DEFAULT false,
        "loadDefer" BOOLEAN NOT NULL DEFAULT false,
        "priority" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "script_sections_pkey" PRIMARY KEY ("id")
      );
    `;

    // Add unique constraint on name
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "script_sections_name_key" ON "script_sections"("name");
    `;

    console.log('✅ script_sections table created successfully!');

    // Add scriptSectionId column to page_sections if it doesn't exist
    console.log('🔄 Adding scriptSectionId column to page_sections...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "page_sections" ADD COLUMN "scriptSectionId" INTEGER;
      `;
      console.log('✅ scriptSectionId column added to page_sections!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ scriptSectionId column already exists in page_sections');
      } else {
        throw error;
      }
    }

    // Add foreign key constraint
    try {
      await prisma.$executeRaw`
        ALTER TABLE "page_sections" 
        ADD CONSTRAINT "page_sections_scriptSectionId_fkey" 
        FOREIGN KEY ("scriptSectionId") REFERENCES "script_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `;
      console.log('✅ Foreign key constraint added!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        throw error;
      }
    }

    // Create some default script sections
    console.log('🔄 Creating default script sections...');
    
    const defaultScripts = [
      {
        name: 'Google Analytics',
        description: 'Google Analytics tracking script',
        scriptType: 'google-analytics',
        scriptContent: `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`,
        placement: 'footer',
        priority: 1
      },
      {
        name: 'Google Tag Manager',
        description: 'Google Tag Manager script',
        scriptType: 'google-tag-manager',
        scriptContent: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM_CONTAINER_ID');</script>`,
        placement: 'footer',
        priority: 2
      },
      {
        name: 'Custom Footer Script',
        description: 'Custom JavaScript for footer functionality',
        scriptType: 'custom',
        scriptContent: `<script>
// Custom footer script
console.log('Footer script loaded');
</script>`,
        placement: 'footer',
        priority: 10,
        isActive: false
      }
    ];

    for (const script of defaultScripts) {
      try {
        await prisma.scriptSection.create({
          data: script
        });
        console.log(`✅ Created script section: ${script.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`✅ Script section already exists: ${script.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 Script sections migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during script sections migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  addScriptSections()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addScriptSections }; 