// app/dashboard/create-interview/loading.jsx
import ProgressBar from '@/app/components/ui/ProgressBar';

export default function Loading() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Generating Questions...</h2>
      
      <ProgressBar progress={75} />
      
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-300 mt-4">
          Our AI is analyzing the job requirements and crafting relevant questions.
          This may take a few moments...
        </p>
      </div>
    </div>
  );
}
