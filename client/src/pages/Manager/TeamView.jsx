import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Mail, Eye, Users, Calendar } from 'lucide-react';
import API from '../../utils/api';
import { ALLOWANCE_MAP } from '../../utils/constants';
import TeamEntryModal from '../../components/Manager/TeamEntryModal';
import QueryModal from '../../components/Manager/QueryModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TeamView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [teamEntries, setTeamEntries] = useState([]);
  const [myTeam, setMyTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryEntry, setQueryEntry] = useState(null);
  const [error, setError] = useState('');

  const month = format(currentDate, 'yyyy-MM');
  const monthName = format(currentDate, 'MMMM yyyy');

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (myTeam.length > 0) {
      fetchTeamEntries();
    }
  }, [month, myTeam]);

  const fetchMyTeam = async () => {
    setTeamLoading(true);
    try {
      const response = await API.get('/manager/my-team');
      setMyTeam(response.data.team);
      setError('');
    } catch (error) {
      console.error('Failed to fetch team:', error);
      setError('Failed to load team information');
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchTeamEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/allowance/team/${month}`);
      setTeamEntries(response.data);
      console.log('Team entries loaded:', response.data);
    } catch (error) {
      console.error('Failed to fetch team entries:', error);
      setError('Failed to load team entries');
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

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEntryForEmployee = (employeeId, date) => {
    return teamEntries.find(entry => 
      entry.employee._id === employeeId && 
      isSameDay(new Date(entry.date), date)
    );
  };

  const handleViewEntry = async (entryId) => {
    try {
      const response = await API.get(`/allowance/entry/${entryId}`);
      setSelectedEntry(response.data);
      setIsEntryModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch entry details:', error);
      setError('Failed to load entry details');
    }
  };

  const handleQueryEntry = (entry) => {
    setQueryEntry(entry);
    setIsQueryModalOpen(true);
  };

  const days = getDaysInMonth();

  // Group entries by employee for better organization
  const employeesWithEntries = myTeam.map(employee => {
    const employeeEntries = teamEntries.filter(entry => 
      entry.employee._id === employee._id
    );
    return {
      ...employee,
      entries: employeeEntries,
      entryCount: employeeEntries.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team View</h1>
          <p className="text-gray-600">Monitor your team's allowances and shifts for {monthName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {myTeam.length} Team Members
            </span>
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Team Table */}
      {teamLoading ? (
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Loading team information...</p>
        </div>
      ) : myTeam.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
          <p className="text-gray-600">
            You don't have any employees reporting to you yet.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{myTeam.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Entries This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{teamEntries.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(teamEntries.map(entry => entry.employee._id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Table */}
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading team entries...</p>
            </div>
          ) : teamEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Entries Found</h3>
              <p className="text-gray-600 mb-4">
                Your team members haven't created any allowance entries for {monthName} yet.
              </p>
              <div className="text-sm text-gray-500 space-y-1 max-w-md mx-auto">
                <p>• Ask team members to add their shift entries in the Calendar</p>
                <p>• Make sure they're selecting entries for {monthName}</p>
                <p>• Check if team members have completed their profile setup</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      {days.map(day => (
                        <th key={day.toISOString()} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {format(day, 'd')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeesWithEntries.map(employee => (
                      <tr key={employee._id} className={employee.entryCount === 0 ? 'opacity-60' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                              {employee.entryCount > 0 && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {employee.entryCount} entries
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.employeeId}
                            </div>
                          </div>
                        </td>
                        {days.map(day => {
                          const entry = getEntryForEmployee(employee._id, day);
                          return (
                            <td key={day.toISOString()} className="px-2 py-4 text-center">
                              {entry ? (
                                <div className="flex flex-col items-center space-y-1">
                                  <div className={`
                                    text-xs px-2 py-1 rounded text-white font-medium w-full
                                    ${entry.allowance > 0 ? 'bg-green-500' : 'bg-gray-500'}
                                  `}>
                                    {ALLOWANCE_MAP[entry.type]?.label || entry.type}
                                    {entry.isWFH && ' + WFH'}
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleViewEntry(entry._id)}
                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="View Details"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleQueryEntry(entry)}
                                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Send Query"
                                    >
                                      <Mail className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Entry Detail Modal */}
      <TeamEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        entry={selectedEntry}
      />

      {/* Query Modal */}
      <QueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        entry={queryEntry}
        onSend={() => {
          setIsQueryModalOpen(false);
          setQueryEntry(null);
        }}
      />
    </div>
  );
};

export default TeamView;