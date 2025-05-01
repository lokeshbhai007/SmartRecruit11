"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import ProgressBar from "@/app/components/ui/ProgressBar";
import { useInterviewContext } from "@/app/context/InterviewContext";

export default function PreviousInterviews() {
  const { interviews, loading, error, fetchInterviews } = useInterviewContext();

  useEffect(() => {
    // Only fetch if we don't already have interviews data
    if (interviews.length === 0) {
      fetchInterviews();
    }
  }, [fetchInterviews, interviews.length]);

  const copyToClipboard = (url) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        alert("Candidate URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="secondary" className="mr-4">
            &larr; Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Previous Interviews</h1>
        <Link href="/dashboard/create-interview">
          <Button className="px-6">Create New Interview</Button>
        </Link>
      </div>

      {loading ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <ProgressBar progress={70} />
          <p className="text-gray-300 text-center mt-2">
            Loading interviews...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-4 rounded">
          {error}
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
          <p className="text-gray-300 mb-4">
            No interviews found. Create your first interview!
          </p>
          <Link href="/dashboard/create-interview">
            <Button className="px-6">Create New Interview</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors duration-200"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {interview.jobPosition}
                  </h2>
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    {interview.level}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-gray-300">
                      {interview.duration} min
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-gray-300">
                      {Array.isArray(interview.interviewType)
                        ? interview.interviewType.join(", ")
                        : interview.interviewType}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300">
                      {formatDate(interview.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 px-5 py-3 flex justify-between items-center">
                <button
                  onClick={() => copyToClipboard(interview.candidateAccessUrl)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Copy Candidate Link
                </button>
                <Link
                  href={`/dashboard/interview-details/${interview.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
