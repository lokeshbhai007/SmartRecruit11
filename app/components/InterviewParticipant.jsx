// app/components/InterviewParticipant.jsx
import React from "react";

const InterviewParticipant = ({ 
  isActive, 
  isAI, 
  isSpeaking, 
  name, 
  initial 
}) => {
  const activeLabel = isAI ? "Speaking..." : "Your turn ";
  const activeColor = isAI ? "blue" : "green";

  return (
    <div className="flex flex-col items-center">
      <div className="relative pulse-container">
        {/* Pulse rings */}
        <div
          className={`pulse-outer ${
            isActive ? "bg-white animate-custom-pulse" : "bg-white/20"
          } opacity-30`}
        ></div>
        <div
          className={`pulse-inner ${
            isActive ? "bg-white animate-custom-pulse" : "bg-white/20"
          } opacity-40`}
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* Avatar circle */}
        <div
          className={`relative rounded-full w-24 h-24 flex items-center justify-center mb-2 z-10 ${
            isActive 
              ? isAI
                ? "bg-gradient-to-br from-blue-500 to-blue-700"
                : "bg-gradient-to-br from-green-500 to-green-700" 
              : isAI
                ? "bg-gradient-to-br from-blue-700 to-blue-900"
                : "bg-gradient-to-br from-gray-600 to-gray-800"
          } shadow-lg border border-${isAI ? "blue" : "gray"}-400/30`}
        >
          {isAI ? (
            <div className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                />
              </svg>
            </div>
          ) : (
            <span className="text-white text-2xl font-bold">
              {initial}
            </span>
          )}

          {/* Status indicator */}
          {isActive && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-900 z-20 shadow-md">
              {isAI ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
      <span className="text-white text-sm mt-10 capitalize font-medium">
        {name}
      </span>
      {isActive && (
        <div className="flex items-center mt-1">
          <span className={`text-${activeColor}-300 text-xs mr-1`}>{activeLabel}</span>
          <div className="flex space-x-1">
            <div className={`w-1 h-1 bg-${activeColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '0s' }}></div>
            <div className={`w-1 h-1 bg-${activeColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-1 h-1 bg-${activeColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewParticipant;