import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, AlertCircle, Users, Mail } from 'lucide-react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Setup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeSetup } = useAuth();
  
  const { email } = location.state || {};
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    managerId: ''
  });
  const [loading, setLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (email) {
      // Auto-extract name from email (part before @aptean.com)
      const extractedName = extractNameFromEmail(email);
      setFormData(prev => ({
        ...prev,
        name: extractedName
      }));
      fetchManagers();
    } else {
      navigate('/login');
    }
  }, [email]);

  // Function to extract name from email
  const extractNameFromEmail = (email) => {
    if (!email) return '';
    
    // Remove @aptean.com and any domain
    let namePart = email.split('@')[0];
    
    // Convert to proper case and replace dots/dashes with spaces
    namePart = namePart
      .replace(/[._-]/g, ' ')  // Replace dots, underscores, dashes with spaces
      .split(' ')              // Split by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join(' ');              // Join back with spaces
    
    return namePart;
  };

  const fetchManagers = async () => {
    try {
      const response = await API.get('/auth/managers');
      setManagers(response.data);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      setError('Failed to load managers list');
    } finally {
      setManagersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await completeSetup({
        email,
        ...formData
      });
      navigate('/');
    } catch (error) {
      setError(error.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!email) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome! Please complete your profile setup
          </p>
        </div>
        
        {/* Email Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Signing in as</p>
              <p className="text-sm text-blue-600">{email}</p>
            </div>
          </div>
        </div>

        {managersLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading managers...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Name Field - Pre-filled from email */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Your name will be auto-filled from email"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Extracted from your email. You can modify if needed.
                </p>
              </div>

              {/* Employee ID */}
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your employee ID"
                />
              </div>

              {/* Manager Selection */}
              <div>
                <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">
                  Select Your Manager
                </label>
                {managers.length > 0 ? (
                  <select
                    id="managerId"
                    name="managerId"
                    required
                    value={formData.managerId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 p-3 border border-yellow-300 bg-yellow-50 rounded-md text-sm text-yellow-800">
                    <Users className="h-4 w-4 inline mr-2" />
                    No managers available. Please contact administrator to create manager accounts first.
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || managers.length === 0}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Setup;