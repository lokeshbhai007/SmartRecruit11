// app/components/InterviewStatusIndicator.jsx
import React from "react";

const InterviewStatusIndicator = ({ status }) => {
  return (
    <div className="mb-4 text-center py-1 bg-gray-800/70 rounded-md shadow-inner">
      {status === "waiting" && (
        <div className="text-yellow-400 text-sm">Preparing your interview...</div>
      )}
      {status === "active" && (
        <div className="text-green-400 text-sm">Interview in progress</div>
      )}
      {status === "completed" && (
        <div className="text-blue-400 text-sm">Interview completed</div>
      )}
    </div>
  );
};

export default InterviewStatusIndicator;