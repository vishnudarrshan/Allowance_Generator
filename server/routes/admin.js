import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import CalendarLock from '../models/CalendarLock.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Add manager
router.post('/managers', [
  body('email').isEmail(),
  body('employeeId').notEmpty(),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, employeeId, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists' });
    }

    const manager = await User.create({
      email,
      employeeId,
      name,
      role: 'manager'
    });

    res.status(201).json({
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      employeeId: manager.employeeId,
      role: manager.role
    });
  } catch (error) {
    console.error('Add manager error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lock/unlock calendar month
router.post('/calendar-lock', [
  body('month').notEmpty(),
  body('isLocked').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { month, isLocked } = req.body;

    const calendarLock = await CalendarLock.findOneAndUpdate(
      { month },
      {
        isLocked,
        lockedBy: req.user._id,
        lockedAt: isLocked ? new Date() : null
      },
      { new: true, upsert: true }
    );

    res.json(calendarLock);
  } catch (error) {
    console.error('Calendar lock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all calendar locks
router.get('/calendar-locks', async (req, res) => {
  try {
    const locks = await CalendarLock.find().populate('lockedBy', 'name');
    res.json(locks);
  } catch (error) {
    console.error('Get locks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Global employee search
router.get('/search-employee', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const employees = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      role: 'employee'
    }).select('name email employeeId');

    res.json(employees);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee allowance summary
router.get('/employee-allowance/:employeeId/:month', async (req, res) => {
  try {
    const { employeeId, month } = req.params;

    const employee = await User.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const entries = await AllowanceEntry.find({
      employee: employee._id,
      month
    });

    const totalAllowance = entries.reduce((sum, entry) => sum + entry.allowance, 0);

    res.json({
      employee: {
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId
      },
      entries,
      totalAllowance,
      entryCount: entries.length
    });
  } catch (error) {
    console.error('Allowance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add manager
router.post('/managers', [
  body('email').isEmail(),
  body('employeeId').notEmpty(),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, employeeId, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists' });
    }

    const manager = await User.create({
      email,
      employeeId,
      name,
      role: 'manager',
      reportingEmployees: [] // Initialize empty array
    });

    res.status(201).json({
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      employeeId: manager.employeeId,
      role: manager.role,
      reportingEmployees: [] // Return empty array
    });
  } catch (error) {
    console.error('Add manager error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;