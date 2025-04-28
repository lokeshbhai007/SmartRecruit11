// app/dashboard/previous-interviews/page.jsx

// Create a page to list previous interviews:

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import ProgressBar from '@/app/components/ui/ProgressBar';

export default function PreviousInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/interviews');
        const data = await response.json();
        
        if (data.success) {
          setInterviews(data.interviews);
        } else {
          throw new Error(data.error || 'Failed to fetch interviews');
        }
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setError(`Failed to load interviews: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const copyToClipboard = (url) => {
    const fullUrl = `${window.location.origin}${url}`;
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
        <h1 className="text-3xl font-bold text-white">Previous Interviews</h1>
        <Link href="/dashboard/create-interview">
          <Button className="px-6">Create New Interview</Button>
        </Link>
      </div>

      {loading ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <ProgressBar progress={70} />
          <p className="text-gray-300 text-center mt-2">Loading interviews...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-4 rounded">
          {error}
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
          <p className="text-gray-300 mb-4">No interviews found. Create your first interview!</p>
          <Link href="/dashboard/create-interview">
            <Button className="px-6">Create New Interview</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300">Job Position</th>
                <th className="px-6 py-4 text-left text-gray-300">Level</th>
                <th className="px-6 py-4 text-left text-gray-300">Duration</th>
                <th className="px-6 py-4 text-left text-gray-300">Type</th>
                <th className="px-6 py-4 text-left text-gray-300">Created</th>
                <th className="px-6 py-4 text-left text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => (
                <tr key={interview.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-white">{interview.jobPosition}</td>
                  <td className="px-6 py-4 text-gray-300">{interview.level}</td>
                  <td className="px-6 py-4 text-gray-300">{interview.duration} min</td>
                  <td className="px-6 py-4 text-gray-300">
                    {Array.isArray(interview.interviewType) 
                      ? interview.interviewType.join(', ') 
                      : interview.interviewType}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(interview.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(interview.candidateAccessUrl)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Copy candidate URL"
                      >
                        Copy Link
                      </button>
                      <Link 
                        href={`/dashboard/interview-details/${interview.id}`}
                        className="text-green-400 hover:text-green-300 ml-3"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}