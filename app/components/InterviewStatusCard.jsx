// app/components/InterviewStatusCard.jsx
import React from "react";

const InterviewStatusCard = ({ listening, jobPosition, candidateName }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
      {/* Question Mark Header */}
      <div className="flex items-center p-2 bg-gray-100">
        <div className="bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-xs mr-2">
          ?
        </div>
        <h3 className="text-gray-700 font-medium text-sm">Getting started</h3>
      </div>

      {/* Message Content */}
      <div className="px-4 py-3">
        {listening && (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p className="text-blue-500 text-xs font-medium">
              Listen carefully to the question before answering
            </p>
          </div>
        )}
        <p className="text-gray-800 text-base mt-1">
          Welcome to your{" "}
          {(jobPosition || "position")
            .charAt(0)
            .toUpperCase() +
            (jobPosition || "position").slice(1)}{" "}
          interview,{" "}
          {(candidateName || "Candidate").charAt(0).toUpperCase() +
            (candidateName || "Candidate").slice(1)}
          !
        </p>
      </div>
    </div>
  );
};

export default InterviewStatusCard;