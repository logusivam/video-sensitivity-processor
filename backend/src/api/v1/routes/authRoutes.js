import express from 'express';
import { register, login, validateOrganization } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply strict rate limiting to auth routes
router.post('/validate-org', authLimiter, validateOrganization);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;