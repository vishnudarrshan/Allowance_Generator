import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Check if system needs first-time setup
router.get('/check-setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    res.json({
      needsSetup: !adminExists,
      hasAdmin: !!adminExists
    });
  } catch (error) {
    console.error('Setup check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create first admin user
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, employeeId } = req.body;

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Check if email is @aptean.com
    if (!email.endsWith('@aptean.com')) {
      return res.status(400).json({ message: 'Only @aptean.com emails allowed' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists' });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      employeeId,
      role: 'admin',
      isActive: true
    });

    // Generate token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { 
      expiresIn: '30d' 
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      employeeId: admin.employeeId,
      token
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;