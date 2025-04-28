// app/page.jsx (Landing Page)

"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import Header from './components/Header';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-6 text-center">AI Voice-Based Recruiter Agent</h1>
          <p className="text-xl mb-12 text-center text-gray-300 max-w-2xl">
            Automate your recruitment process with our AI-powered interview system. Create custom interviews or view your previous ones.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">Create Interview</h2>
              <p className="text-gray-300 mb-6">
                Design a new interview with custom questions based on job position, description, and preferred interview type.
              </p>
              <Link 
                href="/dashboard/create-interview" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md text-center transition-colors"
              >
                Create New Interview
              </Link>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">Previous Interviews</h2>
              <p className="text-gray-300 mb-6">
                Access and review all your previously created interviews, analyze results, and reuse templates.
              </p>
              <Link 
                href="/dashboard/previous-interviews" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-md text-center transition-colors"
              >
                View Previous Interviews
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}