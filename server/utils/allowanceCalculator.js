export const calculateAllowance = (type, isWFH = false) => {
  const allowanceMap = {
    '6am': 400,
    '9am': 0,
    '1pm': 400,
    '5pm': 1200,
    '9pm': 1400,
    'oncall': 2000,
    'patch_full': 2000,
    'patch_half': 1000,
    'activity_full': 2000,
    'activity_half': 1000,
    'leave': 0,
    'weekend': 0,
    'holiday': 0,
    // Note: wfh is not here - it's handled separately
  };
  
  // WFH doesn't affect allowance - return the base allowance for the selected type
  return allowanceMap[type] || 0;
};

export const isEditable = (entryDate) => {
  const today = new Date();
  const entryDateObj = new Date(entryDate);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(today.getMonth() - 2);
  
  return entryDateObj >= twoMonthsAgo;
};

// Helper to check if WFH can be selected with current type
export const canSelectWFH = (type) => {
  const wfhCompatibleTypes = [
    '6am', '9am', '1pm', '5pm', '9pm',
    'oncall', 'patch_full', 'patch_half', 
    'activity_full', 'activity_half'
  ];
  
  return wfhCompatibleTypes.includes(type);
};