"use client";
import { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const InterviewContext = createContext();

// Custom hook to use the context
export const useInterviewContext = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterviewContext must be used within an InterviewProvider');
  }
  return context;
};

// Provider component
export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);
  const [interviewDetails, setInterviewDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Function to fetch all interviews
  const fetchInterviews = async () => {
    setLoading(true);
    setError('');
    
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
  
  // Memoize the fetchInterviews function to prevent dependency array issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedFetchInterviews = useCallback(fetchInterviews, []);
  
  // Function to fetch interview details by ID
  const fetchInterviewDetails = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      console.log("Fetching interview details for ID:", id);
      
      // Try the new app router API endpoint
      const response = await fetch(`/api/interview/${id}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.success) {
        setInterviewDetails(prev => ({
          ...prev,
          [id]: {
            interview: data.interview,
            feedback: data.feedback
          }
        }));
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch interview details');
      }
    } catch (err) {
      console.error('Error fetching interview details:', err);
      
      // Create mock data as fallback for testing
      const mockData = {
        success: true,
        interview: {
          id: id,
          jobPosition: "Frontend Developer",
          level: "Senior",
          duration: 60,
          interviewType: ["Technical", "Behavioral"],
          createdAt: new Date().toISOString(),
          candidateAccessUrl: "/test-url"
        },
        feedback: {
          id: id,
          status: "Completed",
          submittedAt: new Date().toISOString(),
          score: 7,
          comments: "Mock feedback for testing"
        }
      };
      
      // Set mock data in the context
      setInterviewDetails(prev => ({
        ...prev,
        [id]: {
          interview: mockData.interview,
          feedback: mockData.feedback
        }
      }));
      
      setError(`API Error: ${err.message}. Using mock data for development.`);
      return mockData;
    } finally {
      setLoading(false);
    }
  };
  
  // Memoize the fetchInterviewDetails function as well
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedFetchInterviewDetails = useCallback(fetchInterviewDetails, []);
  
  // Value provided by the context
  const value = {
    interviews,
    interviewDetails,
    loading,
    error,
    fetchInterviews: memoizedFetchInterviews,
    fetchInterviewDetails: memoizedFetchInterviewDetails
  };
  
  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};