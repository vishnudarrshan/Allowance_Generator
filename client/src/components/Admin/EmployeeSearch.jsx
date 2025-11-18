import React, { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import API from '../../utils/api';
import { ALLOWANCE_MAP } from '../../utils/constants';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EmployeeSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [allowanceData, setAllowanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    setSearchLoading(true);
    try {
      const response = await API.get(`/admin/search-employee?query=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchEmployeeAllowance = async (employeeId) => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/employee-allowance/${employeeId}/${selectedMonth}`);
      setAllowanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch allowance data:', error);
      setAllowanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setQuery('');
    setResults([]);
    fetchEmployeeAllowance(employee.employeeId);
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  // Generate month options
  const currentYear = new Date().getFullYear();
  const monthOptions = [];
  for (let year = currentYear - 1; year <= currentYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      monthOptions.push(monthStr);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Employees
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by name, employee ID, or email..."
              />
              {searchLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {results.map(employee => (
                  <button
                    key={employee._id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">
                      {employee.employeeId} • {employee.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {monthOptions.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow">
          {/* Employee Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedEmployee.employeeId} • {selectedEmployee.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Allowance for {monthName}</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{allowanceData?.totalAllowance || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Allowance Details */}
          {loading ? (
            <div className="p-8">
              <LoadingSpinner />
            </div>
          ) : allowanceData ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allowance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proof
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allowanceData.entries.map(entry => (
                    <tr key={entry._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ALLOWANCE_MAP[entry.type]?.label || entry.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-semibold ${
                          entry.allowance > 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          ₹{entry.allowance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.proof ? (
                          <span className="text-primary-600">Available</span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {allowanceData.entries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No entries found for {monthName}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No data available for the selected month
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;