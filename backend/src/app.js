import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; // 📌 ADD THIS
import authRoutes from './api/v1/routes/authRoutes.js';
import { apiLimiter } from './api/v1/middlewares/rateLimiter.js';
import videoRoutes from './api/v1/routes/videoRoutes.js'; // 📌 Add this

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration for the frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 📌 ADD THIS

// Apply general rate limiter to all /api/v1 routes
app.use('/api/v1', apiLimiter);

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/videos', videoRoutes); // 📌 Add this


// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(err.stack);
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

export default app;