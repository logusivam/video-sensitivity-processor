import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Fixed: using actual jsonwebtoken library
import User from '../../../models/User.js';
import Organization from '../../../models/Organization.js';
import { Session } from '../../../models/Session.js'; // Fixed: separated imports
import { RevokedToken } from '../../../models/RevokedToken.js';
import { PRIVATE_KEY, PUBLIC_KEY } from '../../../config/keys.js'; // Fixed: using decoded key
import { sendResetEmail } from '../../../services/email.service.js';

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
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const user = await User.findOne({ email }).populate('organizationId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Security Check: Inactivity (6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (user.lastLoginAt && user.lastLoginAt < sixMonthsAgo) {
      user.isActive = false;
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Account inactive due to prolonged inactivity. Please reset your password to reactivate.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate RS256 JWT
    const expiresIn = rememberMe ? '7d' : '1d';
    const token = jwt.sign(
      { sub: user._id, role: user.role, org: user.organizationId?.slug },
      PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn }
    );

    // Create Session
    const sessionDurationDays = rememberMe ? 7 : 1;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + sessionDurationDays);

    await Session.create({
      userId: user._id,
      refreshTokenHash: 'N/A', 
      ipAddress,
      expiresAt,
    });

    // 📌 Set HTTP-Only Cookie
    res.cookie('token', token, {
      httpOnly: true,                               // Prevents JS access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
      sameSite: 'none',                           // Prevents CSRF
      maxAge: sessionDurationDays * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    });

    // We no longer send the 'token' in the JSON body
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.fullName,
        role: user.role,
        organization: user.organizationId?.name
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// 4. Logout (To clear the cookie)
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    
    // Security Best Practice: Don't reveal if email exists, but log it for your dev
    if (!user) {
      console.log(`Reset attempt for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If an account exists, a link has been sent.' });
    }

    console.log(`✅ Generating reset token for: ${email}`);

    const resetToken = jwt.sign(
      { sub: user._id, org: user.organizationId },
      PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn: '5m' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Await the email service
    await sendResetEmail(email, resetLink);
    console.log(`📧 Email sent successfully to: ${email}`);

    res.status(200).json({ message: 'Reset link sent successfully.' });
  } catch (error) {
    console.error('❌ Reset Request Error:', error);
    res.status(500).json({ message: 'Error sending reset email.' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user, also ensure isActive is true (reactivation policy)
    await User.findByIdAndUpdate(decoded.sub, {
      passwordHash: hashedPassword,
      isActive: true
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Link expired or invalid. Please request a new one.' });
  }
};

// 5. Get Current User (/me)
export const getMe = async (req, res) => {
  // req.user is already securely fetched by the requireAuth middleware
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organizationId?.name,
      organizationId: req.user.organizationId?._id
    }
  });
};