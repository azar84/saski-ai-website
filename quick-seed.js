const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function quickSeed() {
  console.log('Creating sample data for testing...');
  
  try {
    // Create some basic features first
    await prisma.globalFeature.createMany({
      data: [
        {
          title: 'Multi-Channel Support',
          description: 'Connect with customers across WhatsApp, SMS, voice, web chat, and social media',
          iconName: 'MessageSquare',
          category: 'integration',
          sortOrder: 1,
          isVisible: true
        },
        {
          title: 'AI-Powered Automation',
          description: 'Intelligent conversations that handle inquiries, bookings, and support automatically',
          iconName: 'Zap',
          category: 'ai', 
          sortOrder: 2,
          isVisible: true
        },
        {
          title: 'Smart Booking System',
          description: 'Automatically schedule appointments and manage calendars',
          iconName: 'Calendar',
          category: 'automation',
          sortOrder: 3,
          isVisible: true
        }
      ]
    });

    // Create a feature group
    const group = await prisma.featureGroup.create({
      data: {
        name: 'Main Landing Group',
        heading: 'AI That Replies, Books, Sells, and Supports — So You Don\'t Have To',
        subheading: 'Complete automation for your customer interactions',
        isActive: true
      }
    });

    console.log('✅ Created feature group:', group.id);
    console.log('✅ Sample data created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await prisma.$disconnect();
}

quickSeed();