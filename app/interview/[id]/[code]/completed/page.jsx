"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInterview } from "@/lib/context/InterviewContext";

export default function InterviewCompletedPage() {
  const params = useParams();
  const router = useRouter();
  const { id, code } = params;
  const { interviewData, candidateResponses } = useInterview();
  
  useEffect(() => {
    // Log the interview data and responses for debugging
    console.log("Interview completed with data:", interviewData);
    console.log("Candidate responses:", candidateResponses);
    
    // Here you would typically save the interview results to your backend
    // This could be implemented in a future enhancement
    
    // Prevent going back to the interview
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function() {
      window.history.pushState(null, "", window.location.href);
    };
    
    // Cleanup function for the effect
    return () => {
      window.onpopstate = null;
    };
  }, [interviewData, candidateResponses]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full p-4">
        <div className="bg-slate-700 rounded-lg p-8 my-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-12 h-12 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Interview Completed!
          </h1>
          
          <p className="text-gray-300 mt-6 mb-7">
            The interview team will review your responses and will contact you
            soon.
          </p>
        </div>
      </div>
    </div>
  );
}