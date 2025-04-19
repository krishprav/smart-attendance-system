import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection via Prisma...');
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

    // Test the connection
    await prisma.$connect();
    console.log('✅ Connection successful!');

    // Check pgvector extension
    try {
      const result = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector'`;
      const resultArray = result as any[];
      
      if (resultArray.length > 0) {
        console.log('✅ pgvector extension is enabled');
      } else {
        console.log('❌ pgvector extension not found - facial recognition features may not work!');
        console.log('Please make sure to install the pgvector extension in your PostgreSQL database.');
      }
    } catch (error) {
      console.error('Error checking pgvector extension:', error);
    }

    // Test basic query
    const currentTime = await prisma.$queryRaw`SELECT NOW()`;
    console.log(`Current database time: ${JSON.stringify(currentTime)}`);

    // Get database version
    const versionInfo = await prisma.$queryRaw`SELECT version()`;
    console.log(`PostgreSQL version: ${JSON.stringify(versionInfo)}`);

    console.log('\nDatabase connection test completed successfully! ✨');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
