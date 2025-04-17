import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth';

const router = express.Router();

// ML API Gateway base URL (update if needed)
const ML_GATEWAY_URL = process.env.ML_GATEWAY_URL || 'http://localhost:8080';

// Proxy helper
async function proxyML(req, res, path, method = 'post') {
  try {
    const url = `${ML_GATEWAY_URL}${path}`;
    const response = await axios({
      url,
      method,
      data: req.body,
      headers: req.headers,
      responseType: 'json',
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
}

// All routes below this require authentication
router.use(protect);

// @route   POST /api/ml/face/register
router.post('/face/register', (req, res) => proxyML(req, res, '/api/face/register'));

// @route   POST /api/ml/face/verify
router.post('/face/verify', (req, res) => proxyML(req, res, '/api/face/verify'));

// @route   POST /api/ml/face/analyze
router.post('/face/analyze', (req, res) => proxyML(req, res, '/api/face/analyze'));

// @route   POST /api/object-detection/idcard
router.post('/object-detection/idcard', (req, res) => proxyML(req, res, '/object-detection/idcard'));

// @route   POST /api/object-detection/phone
router.post('/object-detection/phone', (req, res) => proxyML(req, res, '/object-detection/phone'));

// @route   POST /api/sentiment/analyze
router.post('/sentiment/analyze', (req, res) => proxyML(req, res, '/sentiment/analyze'));

// @route   POST /api/analyze/all
router.post('/analyze/all', (req, res) => proxyML(req, res, '/analyze/all'));

export default router;
