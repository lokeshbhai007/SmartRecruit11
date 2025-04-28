// app/dashboard/create-interview/InterviewQuestions.jsx

// Update the InterviewQuestions component to save to MongoDB:

"use client";
import { useState } from 'react';
import QuestionCard from '@/app/components/QuestionCard';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import ProgressBar from '@/app/components/ui/ProgressBar';

export default function InterviewQuestions({ interview }) {
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [candidateUrl, setCandidateUrl] = useState('');
  const [error, setError] = useState('');

  const handleSaveInterview = async () => {
    setSaving(true);
    setProgress(10);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Make API call to save interview
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interview),
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.success) {
        setSaved(true);
        setCandidateUrl(`${window.location.origin}/interview/${data.interviewId}/${data.candidateAccessCode}`);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error saving interview:', err);
      setError(`Failed to save interview: ${err.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(candidateUrl)
      .then(() => {
        alert('Candidate URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Generated Questions</h2>
        <div className="flex items-center">
          <span className="text-gray-300 mr-2">
            {interview.questions.length} questions • {interview.duration} min • {interview.level} level •{' '}
            {Array.isArray(interview.interviewType) 
              ? interview.interviewType.join(', ') 
              : interview.interviewType}
          </span>
        </div>
      </div>
      
      {saving && (
        <div className="mb-6">
          <ProgressBar progress={progress} />
          <p className="text-gray-300 text-sm">Saving interview...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded my-4">
          {error}
        </div>
      )}
      
      {saved ? (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-4 rounded my-4">
          <h3 className="text-lg font-medium mb-2">Interview Saved Successfully!</h3>
          <p className="mb-3">Share this link with your candidate:</p>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={candidateUrl}
              readOnly
              className="flex-grow bg-gray-700 border border-gray-600 rounded-l px-3 py-2 text-white"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
            >
              Copy
            </button>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard/previous-interviews">
              <Button className="px-6">
                View All Interviews
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {interview.questions.map((question, index) => (
              <QuestionCard key={index} question={question} index={index} />
            ))}
          </div>
              
          <div className="mt-8 flex justify-end">
            <Button 
              className="px-6" 
              onClick={handleSaveInterview}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Create Interview & Finish'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}