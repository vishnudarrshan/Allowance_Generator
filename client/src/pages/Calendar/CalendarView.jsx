import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Edit3 } from 'lucide-react';
import API from '../../utils/api';
import { ALL_OPTIONS, ALLOWANCE_MAP } from '../../utils/constants';
import EntryModal from '../../components/Calendar/EntryModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

// Helper functions for native date handling
const formatMonth = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatDate = (date, formatStr) => {
  // Simple formatter for common formats
  if (formatStr === 'd') return date.getDate().toString();
  if (formatStr === 'MMMM yyyy') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (formatStr === 'MMM yy') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  if (formatStr === 'MMMM d, yyyy') {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (formatStr === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString();
};

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

const isToday = (date) => {
  const today = new Date();
  return isSameDay(date, today);
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const startOfWeek = (date, weekStartsOn = 0) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfWeek = (date, weekStartsOn = 0) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
  result.setDate(result.getDate() + diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

const eachDayOfInterval = ({ start, end }) => {
  const days = [];
  const current = new Date(start);
  
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthLocked, setMonthLocked] = useState(false);

  const month = formatMonth(currentDate);
  const monthName = formatDate(currentDate, 'MMMM yyyy');

  useEffect(() => {
    fetchEntries();
  }, [month]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/allowance/month/${month}`);
      setEntries(response.data.entries);
      setMonthLocked(response.data.locked);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get the start of the calendar (Sunday of the week containing month start)
    const calendarStart = startOfWeek(monthStart, 0); // 0 = Sunday
    
    // Get the end of the calendar (Saturday of the week containing month end)
    const calendarEnd = endOfWeek(monthEnd, 0); // 0 = Sunday
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getEntryForDate = (date) => {
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, date);
    });
  };

  const handleDateClick = (date) => {
    if (monthLocked) return;

    const entry = getEntryForDate(date);
    setSelectedDate(date);
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (data) => {
    try {
      await API.post('/allowance/entry', {
        date: selectedDate.toISOString(),
        ...data
      });
      await fetchEntries();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert(error.response?.data?.message || 'Failed to save entry');
    }
  };

  const calendarDays = getCalendarDays();
  const totalAllowance = entries.reduce((sum, entry) => sum + entry.allowance, 0);

  // Check if a date is in the current month
  const isCurrentMonth = (date) => {
    return formatMonth(date) === month;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allowance Calendar</h1>
          <p className="text-gray-600">Manage your daily allowances and shifts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Allowance for {monthName}</p>
            <p className="text-2xl font-bold text-green-600">₹{totalAllowance}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {monthLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <Lock className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">
            This month is locked and cannot be modified.
          </span>
        </div>
      )}

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map(day => {
              const entry = getEntryForDate(day);
              const isWeekendDay = isWeekend(day);
              const isCurrentDay = isToday(day);
              const inCurrentMonth = isCurrentMonth(day);
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => inCurrentMonth && handleDateClick(day)}
                  className={`
                    min-h-[100px] bg-white p-2 transition-colors
                    ${inCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                    ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}
                    ${monthLocked && inCurrentMonth ? 'cursor-not-allowed opacity-60' : ''}
                    ${!inCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`
                      text-sm font-medium
                      ${isCurrentDay ? 'text-primary-600' : inCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${!inCurrentMonth ? 'text-gray-400' : ''}
                    `}>
                      {formatDate(day, 'd')}
                    </span>
                    {entry && inCurrentMonth && <Edit3 className="h-3 w-3 text-gray-400" />}
                  </div>
                  
                  {entry && inCurrentMonth && (
                    <div className="space-y-1">
                      <div className={`
                        text-xs px-1 py-0.5 rounded text-white text-center font-medium
                        ${entry.allowance > 0 ? 'bg-green-500' : 'bg-gray-500'}
                      `}>
                        {ALLOWANCE_MAP[entry.type]?.label || entry.type}
                        {entry.isWFH && ' + WFH'}
                      </div>
                      {entry.allowance > 0 && (
                        <div className="text-xs font-semibold text-green-600 text-center">
                          ₹{entry.allowance}
                        </div>
                      )}
                    </div>
                  )}

                  {isWeekendDay && !entry && inCurrentMonth && (
                    <div className="text-xs text-gray-400 text-center mt-2">
                      Weekend
                    </div>
                  )}

                  {/* Show month for days outside current month */}
                  {!inCurrentMonth && (
                    <div className="text-xs text-gray-300 text-center mt-2">
                      {formatDate(day, 'MMM')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ALL_OPTIONS.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded ${
                  option.allowance > 0 ? 'bg-green-500' : 'bg-gray-500'
                }`}
              ></div>
              <span className="text-xs text-gray-600">{option.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs text-gray-600">+ WFH = Work From Home (same allowance)</span>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        entry={selectedEntry}
        onSave={handleSaveEntry}
        disabled={monthLocked}
      />
    </div>
  );
};

export default CalendarView;