// app/interview/[id]/[code]/start.jsx

"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function InterviewStartPage() {
  const params = useParams();
  const router = useRouter();
  const { id, code } = params;
  
  const [candidateData, setCandidateData] = useState(null);
  const [listening, setListening] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        // Fetch candidate data from your API
        const response = await fetch(`/api/candidate-data/${id}?code=${code}`);
        const data = await response.json();
        
        if (data.success) {
          setCandidateData(data.candidate);
        } else {
          throw new Error(data.error || 'Failed to load candidate data');
        }
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError(`Failed to load interview: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id && code) {
      fetchCandidateData();
    }
  }, [id, code]);
  
  const endInterview = () => {
    // Handle end interview logic
    if (confirm("Are you sure you want to end this interview?")) {
      router.push(`/interview/${id}/${code}/results`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full p-4">
        {/* Header Banner */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">Smart</span>
              <span className="text-yellow-400">Recruit</span>
            </h1>
            <p className="text-white text-center">
              "Welcome! The interview has started. Feel free to speak naturally — the AI 
              interviewer is here to assist you throughout. Take your time and stay confident."
            </p>
          </div>
        </div>
        
        {/* Interview Progress Bar */}
        <div className="bg-slate-800 rounded-lg h-2 mb-6">
          <div className="bg-blue-500 h-full rounded-lg" style={{ width: '10%' }}></div>
        </div>
        
        {/* Interview Interface */}
        <div className="flex items-start gap-4 mb-6">
          {/* AI Interviewer */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mb-2">
              <div className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                </svg>
              </div>
            </div>
            <span className="text-white text-sm">AI Interviewer</span>
          </div>
          
          {/* Interview Content */}
          <div className="flex-1">
            {listening ? (
              <div className="bg-slate-800 p-4 rounded-lg text-gray-400 text-center">
                Listening...
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg">
                {/* Interview question will appear here */}
              </div>
            )}
          </div>
          
          {/* Candidate */}
          <div className="flex flex-col items-center">
            <div className="bg-slate-700 rounded-full w-20 h-20 flex items-center justify-center mb-2">
              <span className="text-white text-2xl font-bold">
                {candidateData?.name?.charAt(0) || 'C'}
              </span>
            </div>
            <span className="text-white text-sm">
              {candidateData?.name || 'Candidate'}
            </span>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">Getting started</span>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-800">
              Welcome to your full stack developer interview, {candidateData?.name || 'Candidate'}!
            </p>
          </div>
        </div>
        
        {/* End Interview Button */}
        <button 
          onClick={endInterview}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          End Interview
        </button>
      </div>
    </div>
  );
}