export const ALLOWANCE_TYPES = {
  shifts: [
    { value: '6am', label: '6AM Shift', allowance: 400 },
    { value: '9am', label: '9AM Shift', allowance: 0 },
    { value: '1pm', label: '1PM Shift', allowance: 400 },
    { value: '5pm', label: '5PM Shift', allowance: 1200 },
    { value: '9pm', label: '9PM Shift', allowance: 1400 },
  ],
  special: [
    { value: 'oncall', label: 'On Call', allowance: 2000 },
    { value: 'patch_full', label: 'Patch (Full Day)', allowance: 2000 },
    { value: 'patch_half', label: 'Patch (Half Day)', allowance: 1000 },
    { value: 'activity_full', label: 'Activity (Full Day)', allowance: 2000 },
    { value: 'activity_half', label: 'Activity (Half Day)', allowance: 1000 },
  ],
  others: [
    { value: 'leave', label: 'Leave', allowance: 0 },
    { value: 'weekend', label: 'Weekend', allowance: 0 },
    { value: 'holiday', label: 'Public Holiday', allowance: 0 },

  ]
};

export const ALLOWANCE_MAP = ALLOWANCE_TYPES.shifts
  .concat(ALLOWANCE_TYPES.special)
  .concat(ALLOWANCE_TYPES.others)
  .reduce((map, item) => {
    map[item.value] = item;
    return map;
  }, {});

// WFH is now a separate flag that can be combined with any shift
export const WFH_OPTION = {
  value: 'wfh',
  label: 'Work From Home',
  allowance: 0 // Doesn't affect allowance calculation
};

export const SHIFT_OPTIONS = ALLOWANCE_TYPES.shifts.map(shift => ({
  ...shift,
  group: 'shifts'
}));

// Helper to check if WFH can be selected with current type
export const canSelectWFH = (type) => {
  const wfhCompatibleTypes = [
    '6am', '9am', '1pm', '5pm', '9pm',
    'oncall', 'patch_full', 'patch_half', 
    'activity_full', 'activity_half'
  ];
  
  return wfhCompatibleTypes.includes(type);
};

export const ALL_OPTIONS = [
  ...ALLOWANCE_TYPES.shifts,
  ...ALLOWANCE_TYPES.special,
  ...ALLOWANCE_TYPES.others
];