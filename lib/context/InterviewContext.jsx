// lib/context/InterviewContext.jsx
"use client";
import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext();

export function InterviewProvider({ children }) {
  const [interviewData, setInterviewData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateResponses, setCandidateResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current question
  const currentQuestion = interviewData?.questions?.[currentQuestionIndex] || null;
  
  // Function to move to the next question
  const nextQuestion = () => {
    if (interviewData?.questions && currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return true;
    }
    return false; // No more questions
  };
  
  // Function to save candidate response
  const saveResponse = (questionId, response) => {
    setCandidateResponses(prev => [
      ...prev,
      { questionId, response, timestamp: new Date() }
    ]);
  };
  
  return (
    <InterviewContext.Provider
      value={{
        interviewData,
        setInterviewData,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions: interviewData?.questions?.length || 0,
        nextQuestion,
        saveResponse,
        candidateResponses,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}