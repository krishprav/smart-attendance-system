import prisma from '../utils/prisma';

async function checkFaceData() {
  try {
    console.log('Checking face registration data in database...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        faceEncoding: true,
        faceRegistered: true,
        faceRegisteredAt: true
      }
    });

    console.log(`Found ${users.length} users in database.`);
    
    // Check users with face registrations
    const usersWithFaces = users.filter(user => user.faceRegistered);
    console.log(`Found ${usersWithFaces.length} users with face registrations.`);
    
    // Detailed info about face registrations
    usersWithFaces.forEach(user => {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
      console.log(`Face registered at: ${user.faceRegisteredAt}`);
      
      if (user.faceEncoding) {
        const encoding = user.faceEncoding;
        if (Array.isArray(encoding)) {
          console.log(`Face encoding is an array with ${encoding.length} elements`);
          console.log(`Sample of face encoding: [${encoding.slice(0, 5).join(', ')}...]`);
        } else if (typeof encoding === 'string') {
          console.log(`Face encoding is stored as a string (needs parsing)`);
          try {
            const parsed = JSON.parse(encoding as string);
            console.log(`Parsed encoding has ${parsed.length} elements`);
          } catch (e) {
            console.log(`Error parsing encoding string: ${e.message}`);
          }
        } else {
          console.log(`Face encoding type: ${typeof encoding}`);
        }
      } else {
        console.log('Face encoding is null or undefined');
      }
    });
    
    console.log('\nDatabase check complete.');
  } catch (error) {
    console.error('Error checking face data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkFaceData();
