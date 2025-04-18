import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error';
import { connectPrismaDB } from './utils/dbPrisma';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';
import complianceRoutes from './routes/compliance';
import analyticsRoutes from './routes/analytics';
import faceRoutes from './routes/face'; // Face recognition routes
import faceRoutesController from './routes/faceRoutes'; // Face controller routes
import mlRoutes from './routes/ml';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Database connection
// Connect to PostgreSQL with Prisma (primary database)
connectPrismaDB()
  .then(() => {
    console.log('PostgreSQL connected successfully!');
  })
  .catch((err) => {
    console.error('PostgreSQL connection error:', err);
    process.exit(1); // Exit if PostgreSQL connection fails (critical database)
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/ml', mlRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API Health Check: http://localhost:${PORT}/health`);
});