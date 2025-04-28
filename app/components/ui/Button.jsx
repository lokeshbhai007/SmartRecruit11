export default function Button({ children, onClick, type = "button", className = "", disabled = false }) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
        } ${className}`}
      >
        {children}
      </button>
    );
  }