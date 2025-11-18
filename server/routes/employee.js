import express from 'express';
import { protect } from '../middleware/auth.js';
import AllowanceEntry from '../models/AllowanceEntry.js';

const router = express.Router();

router.use(protect);

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

// Get employee allowance history
router.get('/allowance-history', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = formatMonth(currentDate);
    
    // Get current month data
    const currentMonthEntries = await AllowanceEntry.find({
      employee: req.user._id,
      month: currentMonth
    });

    // Get past 6 months data
    const pastMonths = [];
    for (let i = 1; i <= 6; i++) {
      const pastDate = subtractMonths(currentDate, i);
      const month = formatMonth(pastDate);
      
      const entries = await AllowanceEntry.find({
        employee: req.user._id,
        month: month
      });
      
      pastMonths.push({
        month: month,
        entries: entries,
        total: entries.reduce((sum, entry) => sum + entry.allowance, 0),
        entryCount: entries.length
      });
    }

    res.json({
      currentMonth: {
        month: currentMonth,
        entries: currentMonthEntries,
        total: currentMonthEntries.reduce((sum, entry) => sum + entry.allowance, 0)
      },
      pastMonths: pastMonths
    });
  } catch (error) {
    console.error('Allowance history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;