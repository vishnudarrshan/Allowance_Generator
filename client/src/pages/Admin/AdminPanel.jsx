import React, { useState, useEffect } from 'react';
import { Plus, Lock, Unlock, Search } from 'lucide-react';
import API from '../../utils/api';
import AddManagerModal from '../../components/Admin/AddManagerModal';
import CalendarLockModal from '../../components/Admin/CalendarLockModal';
import EmployeeSearch from '../../components/Admin/EmployeeSearch';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('managers');
  const [calendarLocks, setCalendarLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'locks') {
      fetchCalendarLocks();
    }
  }, [activeTab]);

  const fetchCalendarLocks = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin/calendar-locks');
      setCalendarLocks(response.data);
    } catch (error) {
      console.error('Failed to fetch calendar locks:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'managers', name: 'Manage Managers' },
    { id: 'locks', name: 'Calendar Locks' },
    { id: 'search', name: 'Employee Search' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage system settings and access</p>
        </div>
        
        {activeTab === 'managers' && (
          <button
            onClick={() => setIsManagerModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Manager</span>
          </button>
        )}
        
        {activeTab === 'locks' && (
          <button
            onClick={() => setIsLockModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Lock className="h-4 w-4" />
            <span>Manage Locks</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'managers' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manager Management</h3>
            <p className="text-gray-600">
              Use the "Add Manager" button to create new manager accounts. Managers can view 
              and query their team members' allowance entries.
            </p>
          </div>
        )}

        {activeTab === 'locks' && (
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Locked By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Locked At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calendarLocks.map(lock => (
                      <tr key={lock._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lock.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lock.isLocked 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {lock.isLocked ? (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 mr-1" />
                                Unlocked
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lock.lockedBy?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lock.lockedAt ? new Date(lock.lockedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {calendarLocks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No calendar locks configured yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <EmployeeSearch />
        )}
      </div>

      {/* Modals */}
      <AddManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        onSuccess={() => setIsManagerModalOpen(false)}
      />

      <CalendarLockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        onSuccess={() => {
          setIsLockModalOpen(false);
          fetchCalendarLocks();
        }}
      />
    </div>
  );
};

export default AdminPanel;