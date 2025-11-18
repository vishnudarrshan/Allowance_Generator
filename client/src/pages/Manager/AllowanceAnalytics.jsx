import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  BarChart3,
  Download,
  Calendar 
} from 'lucide-react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

// Simple bar chart component
const BarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(item => item.total), 1);
  
  return (
    <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
      {data.map((item, index) => (
        <div key={item.month} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
            style={{ 
              height: `${(item.total / maxValue) * (height - 40)}px`,
              minHeight: item.total > 0 ? '4px' : '0px'
            }}
            title={`${item.monthName}: ₹${item.total}`}
          ></div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            {item.monthName}
          </div>
          <div className="text-xs font-semibold text-gray-900 mt-1">
            ₹{item.total}
          </div>
        </div>
      ))}
    </div>
  );
};

const AllowanceAnalytics = () => {
  const [teamAnalytics, setTeamAnalytics] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(6); // 6 months
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamAnalytics();
  }, [timeRange]);

  const fetchTeamAnalytics = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/manager/allowance-analytics?months=${timeRange}`);
      setTeamAnalytics(response.data.monthlyData);
      setMonthlyBreakdown(response.data.monthlyBreakdown);
    } catch (error) {
      console.error('Failed to fetch team analytics:', error);
      setError('Failed to load team analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalTeamAllowance = teamAnalytics.reduce((sum, month) => sum + month.total, 0);
  const averageMonthly = teamAnalytics.length > 0 ? totalTeamAllowance / teamAnalytics.length : 0;
  
  const currentVsPrevious = teamAnalytics.length > 1 
    ? teamAnalytics[0].total - teamAnalytics[1].total
    : 0;

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
          <h1 className="text-2xl font-bold text-gray-900">Team Allowance Analytics</h1>
          <p className="text-gray-600">Track your team's allowance trends and patterns</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Team Allowance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Team Allowance</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalTeamAllowance}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Last {timeRange} months
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {/* Average Monthly */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Monthly</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(averageMonthly)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Per month
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Trend</p>
              <div className={`text-2xl font-bold ${
                currentVsPrevious > 0 ? 'text-green-600' : 
                currentVsPrevious < 0 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {currentVsPrevious > 0 ? '+' : ''}₹{Math.abs(currentVsPrevious)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                vs previous month
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${
              currentVsPrevious > 0 ? 'text-green-500' : 
              currentVsPrevious < 0 ? 'text-red-500' : 'text-gray-400'
            }`} />
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyBreakdown.length > 0 ? monthlyBreakdown[0].employeeCount : 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Current month
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Allowance Trend</h2>
          <p className="text-sm text-gray-600">Team allowance distribution over time</p>
        </div>
        <div className="p-6">
          {teamAnalytics.length > 0 ? (
            <BarChart 
              data={teamAnalytics.map(month => ({
                ...month,
                monthName: format(new Date(month.month + '-01'), 'MMM yy')
              }))} 
              height={300}
            />
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                No allowance data available for the selected time period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h2>
          <p className="text-sm text-gray-600">Detailed monthly allowance summary</p>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Allowance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average per Employee
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyBreakdown.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {format(new Date(month.month + '-01'), 'MMMM yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-green-600">
                      ₹{month.totalAllowance}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {month.employeeCount} employees
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {month.entryCount} entries
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{Math.round(month.averagePerEmployee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {monthlyBreakdown.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                No allowance data available for your team.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowanceAnalytics;