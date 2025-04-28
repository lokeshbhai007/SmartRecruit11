// app/components/InterviewTypeSelector.jsx - Updated for multi-select
import { useState } from 'react';

export default function InterviewTypeSelector({ value, onChange, disabled = false }) {
  const types = [
    { value: 'technical', label: 'Technical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'experience', label: 'Experience' },
    { value: 'problem-solving', label: 'Problem Solving' },
    { value: 'leadership', label: 'Leadership' }
  ];
  
  // Convert string value to array if needed
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  
  const handleCheckboxChange = (type) => {
    const newSelection = selectedValues.includes(type)
      ? selectedValues.filter(t => t !== type)
      : [...selectedValues, type];
    
    // Create a synthetic event to match the onChange interface
    onChange({
      target: {
        id: 'interview-interviewType',
        value: newSelection
      }
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-300 mb-2 font-medium">
        Interview Type (Select Multiple)
      </label>
      <div className="bg-gray-700 rounded-md p-3 border border-gray-600">
        {types.map((type) => (
          <div key={type.value} className="flex items-center mb-2 last:mb-0">
            <input
              type="checkbox"
              id={`type-${type.value}`}
              checked={selectedValues.includes(type.value)}
              onChange={() => handleCheckboxChange(type.value)}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-gray-700"
            />
            <label htmlFor={`type-${type.value}`} className="text-gray-200">
              {type.label}
            </label>
          </div>
        ))}
      </div>
      {selectedValues.length === 0 && (
        <p className="text-red-400 text-sm mt-1">Please select at least one interview type</p>
      )}
    </div>
  );
}