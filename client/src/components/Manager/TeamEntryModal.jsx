import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Calendar, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ALLOWANCE_MAP } from '../../utils/constants';

const TeamEntryModal = ({ isOpen, onClose, entry }) => {
  if (!entry) return null;

  const allowanceInfo = ALLOWANCE_MAP[entry.type];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Entry Details
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee</p>
                  <p className="text-sm text-gray-900">{entry.employee?.name}</p>
                  <p className="text-xs text-gray-500">{entry.employee?.employeeId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(entry.date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Allowance Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-sm text-gray-900">{allowanceInfo?.label || entry.type}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Allowance</p>
                  <p className={`text-lg font-semibold ${
                    entry.allowance > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    ₹{entry.allowance}
                  </p>
                </div>
              </div>
            </div>

            {/* Proof/Description */}
            {entry.proof && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Proof/Description</p>
                <div 
                  className="prose prose-sm max-w-none border rounded-lg p-4 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: entry.proof }}
                />
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {format(new Date(entry.updatedAt), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamEntryModal;