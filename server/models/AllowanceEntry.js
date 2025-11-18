import mongoose from 'mongoose';

const allowanceEntrySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: [
      '6am', '9am', '1pm', '5pm', '9pm', 
      'oncall', 'patch_full', 'patch_half', 
      'activity_full', 'activity_half',
      'leave', 'weekend', 'holiday'
      // Removed 'wfh' from enum - it's now a separate field
    ],
    required: true
  },
  isWFH: {
    type: Boolean,
    default: false
  },
  proof: {
    type: String,
    default: ''
  },
  allowance: {
    type: Number,
    default: 0
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for unique entries per employee per day
allowanceEntrySchema.index({ employee: 1, date: 1 }, { unique: true });
allowanceEntrySchema.index({ employee: 1, month: 1 });
allowanceEntrySchema.index({ date: 1 });

export default mongoose.model('AllowanceEntry', allowanceEntrySchema);