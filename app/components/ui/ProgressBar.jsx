// app/components/ui/ProgressBar.jsx
export default function ProgressBar({ progress }) {
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  }