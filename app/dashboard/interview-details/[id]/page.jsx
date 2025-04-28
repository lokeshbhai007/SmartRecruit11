// app/dashboard/interview-details/[id]/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import QuestionCard from '@/app/components/QuestionCard';
import ProgressBar from '@/app/components/ui/ProgressBar';

export default function InterviewDetails() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setInterview(data.interview);
        } else {
          throw new Error(data.error || 'Failed to fetch interview details');
        }
      } catch (err) {
        console.error('Error fetching interview details:', err);
        setError(`Failed to load interview: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInterview();
    }
  }, [id]);

  const copyToClipboard = () => {
    const fullUrl = `${window.location.origin}${interview.candidateAccessUrl}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        alert('Candidate URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Interview Details</h1>
        <div className="flex space-x-3">
          <Button onClick={() => router.back()} variant="secondary">
            Back
          </Button>
          <Link href="/dashboard/create-interview">
            <Button>Create New Interview</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <ProgressBar progress={70} />
          <p className="text-gray-300 text-center mt-2">Loading interview details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-4 rounded">
          {error}
        </div>
      ) : interview ? (
        <>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Interview Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400">Job Position</p>
                    <p className="text-white text-lg">{interview.jobPosition}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Level</p>
                    <p className="text-white">{interview.level}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p className="text-white">{interview.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Interview Type</p>
                    <p className="text-white">
                      {Array.isArray(interview.interviewType) 
                        ? interview.interviewType.join(', ') 
                        : interview.interviewType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white">{formatDate(interview.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
                <div className="bg-gray-700 p-4 rounded-md max-h-48 overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-wrap">{interview.jobDescription}</p>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-white mb-4">Candidate Link</h2>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={`${window.location.origin}${interview.candidateAccessUrl}`}
                      readOnly
                      className="flex-grow bg-gray-700 border border-gray-600 rounded-l px-3 py-2 text-white text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Questions ({interview.questions.length})
            </h2>
            <div className="space-y-4">
              {interview.questions.map((question, index) => (
                <QuestionCard key={index} question={question} index={index} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
          <p className="text-gray-300">Interview not found.</p>
        </div>
      )}
    </div>
  );
}