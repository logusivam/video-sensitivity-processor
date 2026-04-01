import express from 'express';
import { register, login, validateOrganization,
    requestPasswordReset, resetPassword, logout
 } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply strict rate limiting to auth routes
router.post('/validate-org', authLimiter, validateOrganization);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout); // Logout route (no rate limit needed)
router.post('/request-reset', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);

export default router;