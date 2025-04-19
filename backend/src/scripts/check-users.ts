import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if there are any users
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);

    if (userCount > 0) {
      // Get a sample of users
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studentId: true,
          faceRegistered: true,
          createdAt: true
        }
      });
      
      console.log('Sample users:');
      console.log(JSON.stringify(users, null, 2));
    }

    // Check other tables
    const sessionCount = await prisma.session.count();
    console.log(`Total sessions in database: ${sessionCount}`);

    const attendanceCount = await prisma.attendance.count();
    console.log(`Total attendance records in database: ${attendanceCount}`);

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
