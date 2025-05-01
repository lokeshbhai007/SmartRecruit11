// app/components/FeedbackChart.jsx
"use client";

import { useState } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const FeedbackChart = ({ feedback }) => {
  const [expanded, setExpanded] = useState(false);

  if (!feedback || !feedback.rating) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-gray-300">No feedback data available to visualize</p>
      </div>
    );
  }

  // Format data for radar chart
  const chartData = [
    { subject: 'Technical Skills', score: feedback.rating.technicalSkills, fullMark: 10 },
    { subject: 'Communication', score: feedback.rating.communication, fullMark: 10 },
    { subject: 'Problem Solving', score: feedback.rating.problemSolving, fullMark: 10 },
    { subject: 'Experience', score: feedback.rating.experience, fullMark: 10 }
  ];

  // Format data for score cards
  const scoreData = [
    { name: "Technical Skills", value: feedback.rating.technicalSkills, color: getScoreColor(feedback.rating.technicalSkills) },
    { name: "Communication", value: feedback.rating.communication, color: getScoreColor(feedback.rating.communication) },
    { name: "Problem Solving", value: feedback.rating.problemSolving, color: getScoreColor(feedback.rating.problemSolving) },
    { name: "Experience", value: feedback.rating.experience, color: getScoreColor(feedback.rating.experience) }
  ];

  function getScoreColor(score) {
    if (score >= 8) return 'bg-green-500 text-green-100';
    if (score >= 6) return 'bg-yellow-500 text-yellow-100';
    return 'bg-red-500 text-red-100';
  }

  function getScoreText(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Improvement';
  }

  function getTotalScoreColor(score) {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  return (
    <div className="w-full">
      {/* Toggle button for mobile view */}
      <button 
        className="md:hidden w-full py-3 bg-gray-700 rounded-lg text-white mb-4 flex justify-center items-center"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Chart View' : 'Show Chart View'}
      </button>

      <div className={`${expanded ? 'block' : 'hidden'} md:block`}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Radar Chart Section */}
          <div className="flex-1 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2 text-center">Skills Evaluation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#4b5563" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#9ca3af' }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
                    itemStyle={{ color: '#e5e7eb' }}
                    labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
                    formatter={(value) => [`${value}/10`, 'Score']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Score and Recommendation Section */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4 flex-1">
              <h3 className="text-white font-medium mb-2">Overall Score</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Score</span>
                <span className="text-2xl font-bold text-white">{feedback.totalScore}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
                <div 
                  className={`h-4 rounded-full ${getTotalScoreColor(feedback.totalScore)}`}
                  style={{ width: `${feedback.totalScore}%` }}
                ></div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Recommendation</span>
                  <span className={feedback.recommendation === "Recommended" ? "text-green-400" : "text-red-400"}>
                    {feedback.recommendation}
                  </span>
                </div>
                <p className="text-gray-300 text-sm italic">"{feedback.recommendationMsg}"</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-1">
              <h3 className="text-white font-medium mb-2">Assessment Summary</h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">{feedback.summary}</p>
            </div>
          </div>
        </div>

        {/* Individual Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {scoreData.map((score, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h4 className="text-gray-400 text-sm mb-1">{score.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">{score.value}/10</span>
                <span className={`text-xs px-2 py-1 rounded ${score.color}`}>
                  {getScoreText(score.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackChart;