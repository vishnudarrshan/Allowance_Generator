import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { DollarSign, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AllowanceHistory = () => {
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [pastMonthsData, setPastMonthsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllowanceHistory();
  }, []);

  const fetchAllowanceHistory = async () => {
    setLoading(true);
    try {
      // Get current month data
      const currentMonth = format(new Date(), 'yyyy-MM');
      const currentResponse = await API.get(`/allowance/month/${currentMonth}`);
      
      // Calculate current month total
      const currentTotal = currentResponse.data.entries.reduce((sum, entry) => sum + entry.allowance, 0);
      setCurrentMonthData({
        month: currentMonth,
        total: currentTotal,
        entries: currentResponse.data.entries
      });

      // Get past 6 months data
      const pastMonths = [];
      for (let i = 1; i <= 6; i++) {
        const pastMonth = format(subMonths(new Date(), i), 'yyyy-MM');
        try {
          const response = await API.get(`/allowance/month/${pastMonth}`);
          const total = response.data.entries.reduce((sum, entry) => sum + entry.allowance, 0);
          pastMonths.push({
            month: pastMonth,
            total: total,
            entries: response.data.entries,
            entryCount: response.data.entries.length
          });
        } catch (error) {
          // If no data for that month, still include it with 0 total
          pastMonths.push({
            month: pastMonth,
            total: 0,
            entries: [],
            entryCount: 0
          });
        }
      }
      
      setPastMonthsData(pastMonths);
    } catch (error) {
      console.error('Failed to fetch allowance history:', error);
      setError('Failed to load allowance history');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  const getTrendText = (current, previous) => {
    if (previous === 0) return 'No previous data';
    const difference = current - previous;
    const percentage = ((difference / previous) * 100).toFixed(1);
    
    if (difference > 0) return `+₹${difference} (+${percentage}%)`;
    if (difference < 0) return `-₹${Math.abs(difference)} (${percentage}%)`;
    return 'No change';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allowance History</h1>
          <p className="text-gray-600">Track your monthly allowance earnings</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Current Month Summary */}
      {currentMonthData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Month Total */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{currentMonthData.total}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(), 'MMMM yyyy')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {currentMonthData.entries.length} entries this month
              </p>
            </div>
          </div>

          {/* Trend Comparison */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Trend</p>
                {pastMonthsData.length > 0 && pastMonthsData[0].total > 0 ? (
                  <>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTrendIcon(currentMonthData.total, pastMonthsData[0].total)}
                      <span className="text-lg font-semibold text-gray-900">
                        {getTrendText(currentMonthData.total, pastMonthsData[0].total)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      vs {format(new Date(pastMonthsData[0].month + '-01'), 'MMM yyyy')}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    First month data
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Average Monthly */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Monthly</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{pastMonthsData.length > 0 
                    ? Math.round(pastMonthsData.reduce((sum, month) => sum + month.total, 0) / pastMonthsData.length)
                    : 0
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last {pastMonthsData.length} months
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Past Months History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Past Months History</h2>
          <p className="text-sm text-gray-600">Your allowance earnings for previous months</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {pastMonthsData.length > 0 ? (
            pastMonthsData.map((monthData, index) => (
              <div key={monthData.month} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      monthData.total > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        monthData.total > 0 ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(monthData.month + '-01'), 'MMMM yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {monthData.entryCount} entries
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      monthData.total > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      ₹{monthData.total}
                    </p>
                    {index < pastMonthsData.length - 1 && (
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        {getTrendIcon(monthData.total, pastMonthsData[index + 1].total)}
                        <span className="text-xs text-gray-500">
                          {getTrendText(monthData.total, pastMonthsData[index + 1].total)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Monthly Breakdown */}
                {monthData.entries.length > 0 && (
                  <div className="mt-3 pl-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {monthData.entries.slice(0, 4).map((entry, idx) => (
                        <div key={idx} className="bg-gray-50 rounded px-2 py-1">
                          <span className="font-medium">
                            {format(new Date(entry.date), 'dd')}:
                          </span>
                          <span className="ml-1 text-green-600">
                            ₹{entry.allowance}
                          </span>
                        </div>
                      ))}
                      {monthData.entries.length > 4 && (
                        <div className="bg-gray-50 rounded px-2 py-1 text-gray-500">
                          +{monthData.entries.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Data</h3>
              <p className="text-gray-600">
                You don't have any allowance entries for previous months yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowanceHistory;