import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { X, Home } from 'lucide-react';
import { ALLOWANCE_TYPES, ALLOWANCE_MAP, canSelectWFH } from '../../utils/constants';

const EntryModal = ({ isOpen, onClose, date, entry, onSave, disabled }) => {
  const [selectedType, setSelectedType] = useState('');
  const [proof, setProof] = useState('');
  const [isWFH, setIsWFH] = useState(false);
  const [ReactQuill, setReactQuill] = useState(null);

    useEffect(() => {
    if (isOpen) {
      Promise.all([
        import('react-quill'),
        import('react-quill/dist/quill.snow.css')
      ]).then(([module]) => {
        setReactQuill(() => module.default);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (entry) {
      setSelectedType(entry.type);
      setProof(entry.proof || '');
      setIsWFH(entry.isWFH || false);
    } else {
      setSelectedType('');
      setProof('');
      setIsWFH(false);
    }
  }, [entry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;

    onSave({
      type: selectedType,
      isWFH: isWFH,
      proof: proof
    });
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const allowanceInfo = selectedType ? ALLOWANCE_MAP[selectedType] : null;
  const showWFHToggle = selectedType && canSelectWFH(selectedType);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full max-h-[90vh] bg-white rounded-xl flex flex-col modal-scroll">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold">
              {entry ? 'Edit Entry' : 'Add Entry'} for {date ? format(date, 'MMMM d, yyyy') : ''}
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {disabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    This month is locked and cannot be modified.
                  </p>
                </div>
              )}

              {/* Shift Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Shift/Activity
                </label>
                
                {/* Shifts */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Shifts</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {ALLOWANCE_TYPES.shifts.map(shift => (
                      <button
                        key={shift.value}
                        type="button"
                        onClick={() => setSelectedType(shift.value)}
                        disabled={disabled}
                        className={`
                          p-3 text-left rounded-lg border transition-all duration-200 min-h-[80px] flex flex-col justify-between
                          ${selectedType === shift.value 
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="font-medium text-sm">{shift.label}</div>
                        <div className={`text-xs font-semibold ${
                          shift.allowance > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          ₹{shift.allowance}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Allowances */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Special Allowances</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {ALLOWANCE_TYPES.special.map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedType(item.value)}
                        disabled={disabled}
                        className={`
                          p-3 text-left rounded-lg border transition-all duration-200 min-h-[80px] flex flex-col justify-between
                          ${selectedType === item.value 
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs font-semibold text-green-600">
                          ₹{item.allowance}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Options */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Other</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {ALLOWANCE_TYPES.others.map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedType(item.value)}
                        disabled={disabled}
                        className={`
                          p-3 text-left rounded-lg border transition-all duration-200 min-h-[80px] flex flex-col justify-between
                          ${selectedType === item.value 
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs font-semibold text-gray-500">
                          ₹{item.allowance}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* WFH Toggle - Only show for compatible types */}
                {showWFHToggle && (
                  <div className="mt-4 flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="wfh"
                      checked={isWFH}
                      onChange={(e) => setIsWFH(e.target.checked)}
                      disabled={disabled}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="wfh" className="ml-3 flex items-center text-sm font-medium text-blue-900">
                      <Home className="h-4 w-4 mr-2" />
                      Work From Home (Same allowance applies)
                    </label>
                  </div>
                )}
              </div>

              {/* Proof/Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof/Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={proof}
                    onChange={setProof}
                    modules={modules}
                    readOnly={disabled}
                    theme="snow"
                    style={{ minHeight: '120px' }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Add any proof or description for this entry. You can include text, images, or links.
                </p>
              </div>

              {/* Allowance Summary */}
              {allowanceInfo && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Allowance Summary</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600">{allowanceInfo.label}</span>
                      {isWFH && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          + Work From Home
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-semibold ${
                      allowanceInfo.allowance > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      ₹{allowanceInfo.allowance}
                    </span>
                  </div>
                  {isWFH && (
                    <p className="mt-2 text-xs text-blue-600">
                      ✓ WFH selected - Same allowance applies
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Fixed Footer with Actions */}
          <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-white">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!selectedType || disabled}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {entry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EntryModal;