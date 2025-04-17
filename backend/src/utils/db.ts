import mongoose from 'mongoose';
import config from '../config';

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error}`);
  }
};

/**
 * Check if MongoDB is connected
 */
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export default {
  connectDB,
  disconnectDB,
  isConnected
};
