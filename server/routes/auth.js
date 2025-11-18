import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Mock SSO Login (Replace with real SSO in production)
// Mock SSO Login (Replace with real SSO in production)
// Mock SSO Login
router.post('/sso-login', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    console.log('SSO Login attempt:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if it's aptean.com email
    if (!email.endsWith('@aptean.com')) {
      return res.status(403).json({ message: 'Only aptean.com emails allowed' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user) {
      // First time login - return ACTIVE managers list for selection
      const managers = await User.find({ 
        role: 'manager', 
        isActive: true 
      }).select('name email employeeId');
      
      console.log('First time login, managers available:', managers.length);
      
      return res.status(200).json({ 
        firstTime: true, 
        managers,
        email 
      });
    }

    // Existing user - generate token
    const token = generateToken(user._id);
    console.log('Existing user, generating token for:', user.email);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      token: token
    });

  } catch (error) {
    console.error('SSO Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Complete first-time setup
// Complete first-time setup
router.post('/complete-setup', [
  body('email').isEmail(),
  body('employeeId').notEmpty(),
  body('managerId').notEmpty(),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, employeeId, managerId, name } = req.body;

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Verify manager exists and is actually a manager
    const manager = await User.findOne({ 
      _id: managerId, 
      role: 'manager',
      isActive: true 
    });
    
    if (!manager) {
      return res.status(400).json({ message: 'Selected manager not found or inactive' });
    }

    // Create new employee
    const user = await User.create({
      email,
      employeeId,
      name,
      manager: managerId,
      role: 'employee'
    });

    // Add employee to manager's reportingEmployees array
    await User.findByIdAndUpdate(managerId, {
      $push: { reportingEmployees: user._id }
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email
      },
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Server error during setup' });
  }
});

// Get current user profile
// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'employee') {
      user = await User.findById(req.user._id)
        .populate('manager', 'name email employeeId');
    } else if (req.user.role === 'manager' || req.user.role === 'admin') {
      user = await User.findById(req.user._id)
        .populate('reportingEmployees', 'name email employeeId isActive')
        .populate('manager', 'name email employeeId');
    } else {
      user = await User.findById(req.user._id);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/managers', async (req, res) => {
  try {
    const managers = await User.find({ 
      role: 'manager', 
      isActive: true 
    }).select('name email employeeId');
    
    res.json(managers);
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Failed to fetch managers' });
  }
});


// Complete first-time setup for SSO users
router.post('/complete-setup', [
  body('email').isEmail(),
  body('employeeId').notEmpty(),
  body('managerId').notEmpty(),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, employeeId, managerId, name } = req.body;

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if user already exists by email (SSO user)
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing SSO user with complete profile
      user.employeeId = employeeId;
      user.manager = managerId;
      user.name = name; // Use the name from the form (extracted from email)
      user.profileComplete = true;
      await user.save();
    } else {
      // Create new user (fallback for non-SSO)
      user = await User.create({
        email,
        employeeId,
        name,
        manager: managerId,
        role: 'employee',
        profileComplete: true
      });
    }

    // Verify manager exists and add employee to manager's team
    const manager = await User.findOne({ 
      _id: managerId, 
      role: 'manager',
      isActive: true 
    });
    
    if (!manager) {
      return res.status(400).json({ message: 'Selected manager not found' });
    }

    // Add employee to manager's reportingEmployees array
    await User.findByIdAndUpdate(managerId, {
      $push: { reportingEmployees: user._id }
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email
      },
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Server error during setup' });
  }
});

export default router;