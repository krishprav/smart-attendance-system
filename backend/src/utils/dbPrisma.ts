import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Connect to PostgreSQL database using Prisma
 */
export const connectPrismaDB = async (): Promise<void> => {
  try {
    // Test the connection
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
    
    // Check if pgvector extension is available
    try {
      // Execute a raw query to check for vector extension
      const result = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector'`;
      const resultArray = result as any[];
      
      if (resultArray.length > 0) {
        logger.info('pgvector extension found and enabled');
      } else {
        logger.warn('pgvector extension not found - facial recognition features may not work!');
      }
    } catch (error) {
      logger.error('Error checking pgvector extension:', error);
    }
    
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from PostgreSQL database
 */
export const disconnectPrismaDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL disconnected');
  } catch (error) {
    logger.error('PostgreSQL disconnection error:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectPrismaDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectPrismaDB();
  process.exit(0);
});

export default prisma;