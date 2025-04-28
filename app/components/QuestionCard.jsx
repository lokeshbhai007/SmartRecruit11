// app/components/QuestionCard.jsx
export default function QuestionCard({ question, index }) {
  // Map for displaying interview type badges with appropriate colors
  const typeColors = {
    technical: 'bg-blue-600',
    behavioral: 'bg-green-600',
    experience: 'bg-purple-600',
    'problem-solving': 'bg-yellow-600',
    leadership: 'bg-red-600',
    general: 'bg-gray-600'
  };

  const typeColor = typeColors[question.type?.toLowerCase()] || 'bg-gray-600';

  return (
    <div className="bg-gray-800 p-4 rounded-md border border-gray-700 mb-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm">{`Question ${index + 1}`}</span>
        <span className={`text-xs px-2 py-1 rounded ${typeColor} text-white`}>
          {question.type || 'General'}
        </span>
      </div>
      <p className="text-white">{question.question}</p>
    </div>
  );
}