import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/attendance',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@attendance.edu',
  },
  mlApi: {
    url: process.env.ML_API_URL || 'http://localhost:8080',
    face: {
      register: '/api/face/register',
      verify: '/api/face/verify',
      analyze: '/api/face/analyze',
    },
    object: {
      idcard: '/api/object-detection/idcard',
      phone: '/api/object-detection/phone',
    },
    sentiment: {
      analyze: '/api/sentiment/analyze',
    },
    analyzeAll: '/api/analyze/all',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

export default config;