// components/Speaker.jsx
import { useState, useEffect } from "react";

const Speaker = ({ type, name, isTalking, speakerType }) => {
  // Determine if this speaker is active
  const isActive = speakerType === type && isTalking;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`h-16 w-16 rounded-full ${
            isActive
              ? `ring-4 ${type === "ai" ? "ring-blue-400" : "ring-green-400"} ring-opacity-75`
              : ""
          } ${
            type === "ai"
               ? "bg-gradient-to-br from-blue-500 to-blue-700"
               : "bg-gradient-to-br from-gray-600 to-gray-800"
          } flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300`}
        >
          {type === "ai" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          ) : (
            name ? name.charAt(0).toUpperCase() : "?"
          )}
        </div>
        {isActive && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 animate-pulse flex items-center justify-center">
            <span className="text-white text-xs">🔊</span>
          </span>
        )}
      </div>
      <span className="mt-2 text-white font-medium truncate max-w-[80px]">
        {type === "ai" ? "AI Interviewer" : (name || "Candidate")}
      </span>
      {isActive && (
        <span className={`text-xs ${type === "ai" ? "text-blue-300" : "text-green-300"} animate-pulse mt-1`}>
          Speaking...
        </span>
      )}
    </div>
  );
};

export default Speaker;