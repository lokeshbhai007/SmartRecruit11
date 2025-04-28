// app/components/ui/TextArea.jsx - Updated with disabled prop
export default function TextArea({ 
  label, 
  id, 
  value, 
  onChange, 
  placeholder = "", 
  rows = 4, 
  required = false,
  disabled = false
}) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
}