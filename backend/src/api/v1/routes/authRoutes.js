import express from 'express';
import { register, login, validateOrganization,
    requestPasswordReset, resetPassword, logout, getMe
 } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { requireAuth } from '../middlewares/requireAuth.js'; // 📌 ADD THIS


const router = express.Router();

// Apply strict rate limiting to auth routes
router.post('/validate-org', authLimiter, validateOrganization);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', requireAuth, logout); // Logout route (no rate limit needed)
router.post('/request-reset', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', requireAuth, getMe); // Get current user info (requires auth middleware in controller)

export default router;