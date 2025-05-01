// app/dashboard/create-interview/page.jsx

// Update the create-interview page to handle the flow:

"use client";
import { useState } from 'react';
import InterviewForm from '@/app/components/InterviewForm';
import InterviewQuestions from './InterviewQuestions';
import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function CreateInterview() {
  const [generatedInterview, setGeneratedInterview] = useState(null);

  const handleQuestionsGenerated = (interview) => {
    setGeneratedInterview(interview);
    // Scroll to the questions after a short delay
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById('interview-questions')?.offsetTop || 0,
        behavior: 'smooth',
      });
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='flex items-center mb-4'>
      <Link href="/">
          <Button variant="secondary" className="mr-4">
            &larr; Back to dashboard
          </Button>
        </Link>
      {/* <h1 className="text-3xl items-center font-bold text-white mb-6">Create New Interview</h1> */}
      </div>
      <InterviewForm onQuestionsGenerated={handleQuestionsGenerated} />
      
      {generatedInterview && (
        <div id="interview-questions">
          <InterviewQuestions interview={generatedInterview} />
        </div>
      )}
    </div>
  );
}