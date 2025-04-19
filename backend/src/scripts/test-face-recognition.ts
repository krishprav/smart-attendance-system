import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import config from '../config';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Test face registration and matching
async function testFaceRecognition() {
  try {
    console.log('🧪 Testing Face Recognition Setup');
    console.log('==================================');
    
    // Step 1: Connect to PostgreSQL
    console.log('\n📊 Step 1: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Step 2: Check pgvector extension
    console.log('\n🧩 Step 2: Checking pgvector extension...');
    const vectorExtension = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector'`;
    console.log(`✅ pgvector extension status: ${(vectorExtension as any[]).length > 0 ? 'Installed' : 'Not installed'}`);

    // Step 3: Create a test user
    console.log('\n👤 Step 3: Creating test user...');
    
    // Delete test user if exists
    await prisma.user.deleteMany({
      where: {
        email: 'test-face@example.com'
      }
    });
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Test Face User',
        email: 'test-face@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'TEST001',
        isVerified: true,
      }
    });
    console.log(`✅ Created test user with ID: ${testUser.id}`);
    
    // Step 4: Check ML API connection
    console.log('\n🧠 Step 4: Testing ML API connection...');
    try {
      const healthResponse = await axios.get(`${config.mlApi.url}/health`, { timeout: 5000 });
      console.log(`✅ ML API health check: ${healthResponse.status === 200 ? 'OK' : 'Error'}`);
    } catch (error) {
      console.log('❌ ML API not accessible. Please start the ML service.');
      console.log('⚠️ Continuing with mock face data for testing...');
    }
    
    // Step 5: Create mock face encoding
    console.log('\n🔢 Step 5: Creating mock face encoding...');
    // Create a mock face encoding (512 dimensions with random values between -1 and 1)
    const mockFaceEncoding = Array.from({ length: 512 }, () => Math.random() * 2 - 1);
    console.log(`✅ Created mock face encoding with ${mockFaceEncoding.length} dimensions`);
    
    // Step 6: Register face encoding
    console.log('\n📝 Step 6: Registering face encoding to database...');
    
    // Update the user with the face encoding
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: {
        vector_encoding: mockFaceEncoding as any, // Type cast for pgvector
        faceEncoding: mockFaceEncoding, // Regular array field
        faceRegistered: true,
        faceRegisteredAt: new Date()
      }
    });
    
    console.log(`✅ Face encoding registered for user: ${updatedUser.name}`);
    
    // Step 7: Test face query
    console.log('\n🔍 Step 7: Testing face query capabilities...');
    
    // Test if we can retrieve the user with face encoding
    const userWithFace = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    console.log(`✅ Retrieved user with face data: ${userWithFace?.name}`);
    console.log(`✅ Face registered: ${userWithFace?.faceRegistered}`);
    console.log(`✅ Face registered at: ${userWithFace?.faceRegisteredAt}`);
    
    // Step 8: Test vector similarity (if pgvector is available)
    console.log('\n📐 Step 8: Testing vector similarity search...');
    
    try {
      // Create a slightly modified version of the face encoding to simulate a match
      const similarFaceEncoding = [...mockFaceEncoding];
      // Modify some dimensions slightly
      for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * similarFaceEncoding.length);
        similarFaceEncoding[randomIndex] += (Math.random() * 0.2 - 0.1); // Small random change
      }
      
      // Test cosine similarity search (may fail if pgvector not configured correctly)
      const result = await prisma.$queryRaw`
        SELECT id, name, "studentId", 
               1 - (vector_encoding <=> ${similarFaceEncoding}::vector) as similarity
        FROM "User"
        WHERE "faceRegistered" = true
        ORDER BY similarity DESC
        LIMIT 1
      `;
      
      console.log('✅ Vector similarity search successful');
      console.log(`✅ Best match: ${(result as any[])[0]?.name} with similarity ${(result as any[])[0]?.similarity}`);
    } catch (error) {
      console.log('❌ Vector similarity search failed. This may be due to pgvector configuration.');
      console.error(error);
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user deleted');
    
    console.log('\n✨ Face recognition test completed!');
    console.log('==================================');
    console.log('Summary:');
    console.log('- PostgreSQL connection: ✅');
    console.log(`- pgvector extension: ${(vectorExtension as any[]).length > 0 ? '✅' : '❌'}`);
    console.log('- User creation: ✅');
    console.log('- Face encoding storage: ✅');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the test
testFaceRecognition()
  .then(() => {
    console.log('Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });