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
  
  const toggleSelection = (type) => {
    if (disabled) return;
    
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
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const isSelected = selectedValues.includes(type.value);
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleSelection(type.value)}
              disabled={disabled}
              className={`px-4 py-2 rounded-md transition-colors duration-200 
                ${isSelected 
                  ? 'bg-green-700 text-white' 
                  : 'bg-gray-700 text-gray-300 border border-gray-600'} 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
            >
              {type.label}
              {isSelected && (
                <span className="ml-2">✓</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedValues.length === 0 && (
        <p className="text-red-400 text-sm mt-2">Please select at least one interview type</p>
      )}
    </div>
  );
}