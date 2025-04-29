// app/components/InterviewAnimationStyles.jsx
import React from "react";

const InterviewAnimationStyles = () => {
  return (
    <style jsx>{`
      @keyframes pulse {
        0% {
          opacity: 0.3;
          transform: scale(1.05);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.2);
        }
        100% {
          opacity: 0.3;
          transform: scale(1.05);
        }
      }

      .animate-custom-pulse {
        animation: pulse 2.5s ease-in-out infinite;
      }

      .pulse-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .pulse-outer {
        position: absolute;
        inset: -8px;
        border-radius: 9999px;
        transform: scale(1.15);
      }

      .pulse-inner {
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        transform: scale(1.08);
      }
    `}</style>
  );
};

export default InterviewAnimationStyles;