import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Fixed: using actual jsonwebtoken library
import User from '../../../models/User.js';
import Organization from '../../../models/Organization.js';
import { Session } from '../../../models/Session.js'; // Fixed: separated imports
import { RevokedToken } from '../../../models/RevokedToken.js';
import { PRIVATE_KEY } from '../../../config/keys.js'; // Fixed: using decoded key

// 1. Validate Organization (Debounced Check)
export const validateOrganization = async (req, res) => {
  const { name } = req.body;
  if (!name || name.length < 3) return res.status(400).json({ valid: false, message: 'Minimum 3 characters required.' });
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const exists = await Organization.findOne({ $or: [{ name }, { slug }] });
  
  if (exists) {
    return res.status(409).json({ valid: false, message: 'Organization name already exists. Please choose another.' });
  }
  res.status(200).json({ valid: true, message: 'Organization name is available!', slug });
};

// 2. Register
export const register = async (req, res) => {
  const { fullName, email, password, organization } = req.body;
  
  const slug = organization.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let org = await Organization.findOne({ slug });
  
  if (org) return res.status(400).json({ message: 'Organization already exists.' });
  
  org = await Organization.create({ name: organization, slug });
  const passwordHash = await bcrypt.hash(password, 12);
  
  const user = await User.create({
    email,
    passwordHash,
    fullName,
    organizationId: org._id,
    role: 'admin', // First user of unique org is admin
    isActive: true
  });
  
  res.status(201).json({ message: 'Account created successfully.', userId: user._id });
};

// 3. Login
export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  // Check 6-month inactivity rule
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  if (user.lastLoginAt && user.lastLoginAt < sixMonthsAgo) {
    user.isActive = false;
    await user.save();
  }

  if (!user.isActive) {
    return res.status(403).json({ 
      message: 'Account inactive due to 6 months of inactivity. Please use Forgot Password to reset and reactivate.' 
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

  user.lastLoginAt = new Date();
  await user.save();

  // JWT Generation (RS256)
  const expiresIn = rememberMe ? '7d' : '1d';
  const token = jwt.sign(
    { sub: user._id, role: user.role, org: user.organizationId }, 
    PRIVATE_KEY, 
    { algorithm: 'RS256', expiresIn }
  );

  // Store Session
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + (rememberMe ? 7 : 1));
  
  await Session.create({
    userId: user._id,
    refreshTokenHash: 'hashed_refresh_token_here', // Implement refresh token strategy later
    ipAddress,
    expiresAt: expirationDate
  });

  res.status(200).json({ token, message: 'Login successful' });
};