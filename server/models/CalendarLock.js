import mongoose from 'mongoose';

const calendarLockSchema = new mongoose.Schema({
  month: {
    type: String, // Format: "2023-11"
    required: true,
    unique: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('CalendarLock', calendarLockSchema);