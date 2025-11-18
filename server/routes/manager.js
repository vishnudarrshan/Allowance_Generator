import express from 'express';
import { body, validationResult } from 'express-validator';
import AllowanceEntry from '../models/AllowanceEntry.js';
import User from '../models/User.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { sendManagerQueryEmail } from '../utils/emailService.js';

const router = express.Router();

// Helper function to format date as YYYY-MM
const formatMonth = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Helper function to subtract months
const subtractMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - months);
  return newDate;
};

// Helper function to format month name
const formatMonthName = (monthString) => {
  const [year, month] = monthString.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

router.use(protect);
router.use(managerOrAdmin);

// Get manager's team with details
router.get('/my-team', async (req, res) => {
  try {
    const manager = await User.findById(req.user._id)
      .populate('reportingEmployees', 'name email employeeId isActive');
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Get current month for context
    const currentMonth = formatMonth(new Date());

    res.json({
      manager: {
        name: manager.name,
        email: manager.email,
        employeeId: manager.employeeId
      },
      team: manager.reportingEmployees,
      teamCount: manager.reportingEmployees.length,
      currentMonth: currentMonth
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send query to employee
router.post('/query-employee', [
  body('employeeId').notEmpty(),
  body('date').isISO8601(),
  body('type').notEmpty(),
  body('message').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, date, type, message } = req.body;

    // Get employee details and verify they report to this manager
    const employee = await User.findOne({ 
      employeeId,
      manager: req.user._id  // Ensure employee reports to this manager
    });
    
    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found or not in your team' 
      });
    }

    // Send email
    const emailSent = await sendManagerQueryEmail(
      employee.email,
      req.user.name,
      new Date(date).toLocaleDateString(),
      type,
      message
    );

    if (emailSent) {
      res.json({ message: 'Query sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Query employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team allowance analytics
router.get('/allowance-analytics', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Get manager's team
    const manager = await User.findById(req.user._id).select('reportingEmployees');
    const teamEmployeeIds = manager.reportingEmployees;

    if (teamEmployeeIds.length === 0) {
      return res.json({
        monthlyData: [],
        monthlyBreakdown: []
      });
    }

    // Get monthly data for the specified time range
    const monthlyData = [];
    const monthlyBreakdown = [];

    for (let i = 0; i < months; i++) {
      const monthDate = subtractMonths(new Date(), i);
      const month = formatMonth(monthDate);
      const monthName = formatMonthName(month);
      
      // Get all entries for the team for this month
      const entries = await AllowanceEntry.find({
        employee: { $in: teamEmployeeIds },
        month: month
      }).populate('employee', 'name');

      const totalAllowance = entries.reduce((sum, entry) => sum + entry.allowance, 0);
      const uniqueEmployees = [...new Set(entries.map(entry => entry.employee._id))];
      
      monthlyData.unshift({
        month: month,
        monthName: monthName,
        total: totalAllowance,
        entryCount: entries.length
      });

      monthlyBreakdown.unshift({
        month: month,
        monthName: monthName,
        totalAllowance: totalAllowance,
        employeeCount: uniqueEmployees.length,
        entryCount: entries.length,
        averagePerEmployee: uniqueEmployees.length > 0 ? totalAllowance / uniqueEmployees.length : 0
      });
    }

    res.json({
      monthlyData: monthlyData,
      monthlyBreakdown: monthlyBreakdown,
      teamSize: teamEmployeeIds.length
    });
  } catch (error) {
    console.error('Team analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;