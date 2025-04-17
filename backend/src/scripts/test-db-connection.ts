import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../utils/db';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance'}`);
    
    // Connect to MongoDB
    await connectDB();
    
    // Get all collections
    const collections = await mongoose.connection.db.collections();
    console.log(`\nAvailable collections (${collections.length}):`);
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.collectionName).countDocuments();
      console.log(`- ${collection.collectionName}: ${count} documents`);
    }
    
    console.log('\nMongoDB connection test successful!');
    
    // Disconnect from MongoDB
    await disconnectDB();
    
    process.exit(0);
  } catch (error) {
    console.error(`\nMongoDB connection test failed: ${error}`);
    process.exit(1);
  }
};

// Run the test
testConnection();
