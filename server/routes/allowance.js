import express from 'express';
import { body, validationResult } from 'express-validator';
import User from "../models/User.js";
import AllowanceEntry from '../models/AllowanceEntry.js';
import CalendarLock from '../models/CalendarLock.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { calculateAllowance, isEditable, canSelectWFH } from '../utils/allowanceCalculator.js';

const router = express.Router();

// All routes protected
router.use(protect);

// Get calendar entries for a specific month
router.get('/month/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const entries = await AllowanceEntry.find({
      employee: req.user._id,
      month
    });

    // Check if month is locked
    const calendarLock = await CalendarLock.findOne({ month });
    const locked = calendarLock ? calendarLock.isLocked : false;

    res.json({ entries, locked });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update allowance entry
router.post('/entry', [
  body('date').isISO8601(),
  body('type').isIn([
    '6am', '9am', '1pm', '5pm', '9pm', 
    'oncall', 'patch_full', 'patch_half', 
    'activity_full', 'activity_half',
    'leave', 'weekend', 'holiday'
  ]),
  body('isWFH').optional().isBoolean(),
  body('proof').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, type, isWFH = false, proof = '' } = req.body;
    const dateObj = new Date(date);
    const month = dateObj.toISOString().substring(0, 7);
    const year = dateObj.getFullYear();

    // Validate WFH selection
    if (isWFH && !canSelectWFH(type)) {
      return res.status(400).json({ 
        message: 'WFH can only be selected with shifts or special allowances' 
      });
    }

    // Check if entry is editable
    if (!isEditable(date)) {
      return res.status(400).json({ message: 'Cannot edit entries older than 2 months' });
    }

    // Check if month is locked
    const calendarLock = await CalendarLock.findOne({ month });
    if (calendarLock && calendarLock.isLocked) {
      return res.status(400).json({ message: 'This month is locked and cannot be modified' });
    }

    const allowance = calculateAllowance(type, isWFH);

    // Upsert entry
    const entry = await AllowanceEntry.findOneAndUpdate(
      { employee: req.user._id, date: dateObj },
      {
        type,
        isWFH,
        proof,
        allowance,
        month,
        year
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(entry);
  } catch (error) {
    console.error('Entry error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Entry already exists for this date' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


// Get team entries for manager - PROPER IMPLEMENTATION
router.get('/team/:month', managerOrAdmin, async (req, res) => {
  try {
    const { month } = req.params;
    
    console.log('=== TEAM VIEW DEBUG ===');
    console.log('Manager:', req.user.name, req.user._id);
    console.log('Requested month:', month);

    let employeeIds = [];

    if (req.user.role === 'manager') {
      // STEP 1: Get manager's reporting employees
      const manager = await User.findById(req.user._id)
        .select('reportingEmployees')
        .populate('reportingEmployees', '_id name email employeeId');
      
      if (!manager) {
        return res.status(404).json({ message: 'Manager not found' });
      }

      employeeIds = manager.reportingEmployees.map(emp => emp._id);
      console.log('Manager team employee IDs:', employeeIds);
      console.log('Manager team details:', manager.reportingEmployees);
      
      if (employeeIds.length === 0) {
        return res.json([]); // No team members
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all employees
      const allEmployees = await User.find({ role: 'employee' }).select('_id');
      employeeIds = allEmployees.map(emp => emp._id);
    }

    // STEP 2: Search for allowance entries for these employees in the specified month
    const teamEntries = await AllowanceEntry.find({
      employee: { $in: employeeIds },
      month: month
    })
    .populate('employee', 'name email employeeId')
    .sort({ 'employee.name': 1, date: 1 });

    console.log('Found allowance entries:', teamEntries.length);
    
    // Log each entry for debugging
    teamEntries.forEach(entry => {
      console.log(`Entry: ${entry.employee.name} - ${entry.date} - ${entry.type} - ₹${entry.allowance}`);
    });

    console.log('=== END DEBUG ===');

    res.json(teamEntries);
  } catch (error) {
    console.error('Team entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific entry details (for manager view)
router.get('/entry/:id', managerOrAdmin, async (req, res) => {
  try {
    const entry = await AllowanceEntry.findById(req.params.id)
      .populate('employee', 'name email employeeId');
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Entry details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;