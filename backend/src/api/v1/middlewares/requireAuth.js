import jwt from 'jsonwebtoken';
import { PUBLIC_KEY } from '../../../config/keys.js';
import User from '../../../models/User.js';
import { RevokedToken } from '../../../models/Session.js';

export const requireAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }

    try {
        // 1. Verify token signature and expiration using RS256 Public Key
        const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });

        // 2. Check if token is explicitly blacklisted (revoked)
        const isRevoked = await RevokedToken.exists({ _id: decoded.jti });
        if (isRevoked) {
            return res.status(401).json({ message: 'Session expired or revoked. Please log in again.' });
        }

        // 3. Attach user to request
        req.user = await User.findById(decoded.sub).select('-passwordHash');
        
        if (!req.user) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }

        if (!req.user.isActive) {
            return res.status(403).json({ message: 'Account is inactive. Please reset your password.' });
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
};