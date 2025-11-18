import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Send } from 'lucide-react';
import { format } from 'date-fns';
import API from '../../utils/api';
import { ALLOWANCE_MAP } from '../../utils/constants';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const QueryModal = ({ isOpen, onClose, entry, onSend }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!entry) return null;

  const allowanceInfo = ALLOWANCE_MAP[entry.type];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      await API.post('/manager/query-employee', {
        employeeId: entry.employee.employeeId,
        date: entry.date,
        type: allowanceInfo?.label || entry.type,
        message: message.trim()
      });

      onSend();
      setMessage('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Send Query to Employee
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Entry Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Employee</p>
                  <p className="text-gray-900">{entry.employee?.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Date</p>
                  <p className="text-gray-900">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Type</p>
                  <p className="text-gray-900">{allowanceInfo?.label || entry.type}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Allowance</p>
                  <p className="text-gray-900">₹{entry.allowance}</p>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your query regarding this entry..."
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Query</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default QueryModal;