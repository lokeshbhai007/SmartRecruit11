// app/interview/[id]/[code]/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import ProgressBar from "@/app/components/ui/ProgressBar";

export default function InterviewStart() {
  const params = useParams();
  const router = useRouter();
  const { id, code } = params;

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${id}?code=${code}`);
        const data = await response.json();

        if (data.success) {
          setInterview(data.interview);
        } else {
          throw new Error(data.error || "Invalid interview link");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError(`Failed to load interview: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id && code) {
      fetchInterview();
    }
  }, [id, code]);

  const validateForm = () => {
    if (!candidateName.trim()) {
      setFormError("Please enter your name");
      return false;
    }

    if (!candidateEmail.trim()) {
      setFormError("Please enter your email");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      setFormError("Please enter a valid email address");
      return false;
    }

    setFormError("");
    return true;
  };

  const startInterview = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Save candidate data to MongoDB
      const response = await fetch("/api/candidate-join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: id,
          candidateCode: code,
          name: candidateName,
          email: candidateEmail,
        }),
      });

      const data = await response.json();

      // Check for already taken interview BEFORE throwing an error
      if (data.alreadyTaken) {
        setFormError(
          "You have already taken this interview. Each candidate can only attempt once."
        );
        setSubmitting(false);
        return;
      }

      // Then check if the response is not OK for other errors
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // If we get here, everything is good - proceed to the interview
      console.log(`Attempting to navigate to: /interview/${id}/${code}/start`);
      router.push(`/interview/${id}/${code}/start`);
      
    } catch (err) {
      console.error("Error saving candidate data:", err);
      setFormError(
        err.message || "Failed to start interview. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        {loading ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <ProgressBar progress={70} />
            <p className="text-gray-300 text-center mt-2">
              Loading interview details...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded text-center">
            {error}
            <p className="mt-2">
              This interview link may be invalid or expired.
            </p>
          </div>
        ) : interview ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white mb-4">
                Welcome to Your {interview.jobPosition} Interview
              </h1>
              <div className="inline-block bg-blue-600/20 border border-blue-500 rounded-lg px-6 py-3 mb-6">
                <p className="text-blue-200">
                  {interview.questions.length} questions • {interview.duration}{" "}
                  min • {interview.level} level
                </p>
              </div>
            </div>

            {/* Candidate Information Form */}
            <div className="mb-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-white mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white mb-2">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formError && (
                  <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded">
                    {formError}
                  </div>
                )}
              </div>
            </div>

            {/* Interview Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-4">
              <h2 className="font-bold text-xl mb-2">Before you start:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure you're in a quiet environment</li>
                <li>Check that your microphone is working</li>
                <li>You'll be asked {interview.questions.length} questions</li>
                <li>Speak clearly and take your time to answer</li>
                <li>Candidate can only take this interview once</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={startInterview}
                className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                disabled={submitting}
              >
                {submitting ? "Starting..." : "Start Interview"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
            <p className="text-gray-300">Interview not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}