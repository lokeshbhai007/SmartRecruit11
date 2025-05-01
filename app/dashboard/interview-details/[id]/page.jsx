//for the showing result purpose


"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import Button from "@/app/components/ui/Button";
import ProgressBar from "@/app/components/ui/ProgressBar";
import { useInterviewContext } from "@/app/context/InterviewContext";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function InterviewDetails() {
  const params = useParams();
  const { id } = params;
  const { interviewDetails, loading, error, fetchInterviewDetails } =
    useInterviewContext();
  const [detailsData, setDetailsData] = useState(null);

  useEffect(() => {
    const loadInterviewDetails = async () => {
      // Check if we already have the details in context
      if (interviewDetails && interviewDetails[id]) {
        setDetailsData(interviewDetails[id]);
        console.log("Interview details from context:", interviewDetails[id]);
      } else {
        // Fetch details if not in context
        console.log("Fetching interview details for ID:", id);
        try {
          const data = await fetchInterviewDetails(id);
          if (data) {
            console.log("API returned data:", data);
            setDetailsData({
              interview: data.interview,
              feedback: data.feedback,
            });
          } else {
            console.error("No data returned from API");
          }
        } catch (err) {
          console.error("Error in component when fetching details:", err);
        }
      }
    };

    // Only run once when the component mounts
    loadInterviewDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Create chart data for skills
  const getSkillsChartData = () => {
    if (!detailsData?.feedback?.feedback?.rating) return [];

    const { technicalSkills, communication, problemSolving, experience } =
      detailsData.feedback.feedback.rating;

    return [
      { name: "Technical", value: technicalSkills || 0, color: "#4ade80" },
      { name: "Communication", value: communication || 0, color: "#60a5fa" },
      { name: "Problem Solving", value: problemSolving || 0, color: "#f97316" },
      { name: "Experience", value: experience || 0, color: "#8b5cf6" },
    ];
  };

  // Get recommendation status color and icon
  const getRecommendationStatus = () => {
    if (!detailsData?.feedback?.feedback?.recommendation)
      return { color: "gray", icon: AlertTriangle, text: "No Recommendation" };

    const recommendation = detailsData.feedback.feedback.recommendation;

    if (recommendation.includes("Recommended")) {
      return { color: "green", icon: CheckCircle, text: recommendation };
    } else {
      return { color: "red", icon: XCircle, text: recommendation };
    }
  };

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/previous-interviews">
          <Button variant="secondary" className="mr-4">
            &larr; Back to Interviews
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Interview Details</h1>
      </div>

      {loading ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <ProgressBar progress={70} />
          <p className="text-gray-300 text-center mt-2">
            Loading interview details...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-4 rounded">
          {error}
        </div>
      ) : !detailsData ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
          <p className="text-gray-300">
            No interview details found for this ID.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl capitalize font-semibold text-white">
                  {detailsData.interview?.jobPosition || "No Job Position"}
                </h2>
                <p className="text-gray-400 mt-1">
                  Interview ID:{" "}
                  <span className="text-gray-300 font-mono text-sm">{id}</span>
                </p>
              </div>

              {detailsData.feedback && (
                <div className="flex items-center">
                  {(() => {
                    const {
                      color,
                      icon: Icon,
                      text,
                    } = getRecommendationStatus();
                    return (
                      <div
                        className={`flex items-center px-4 py-2 rounded-full bg-${color}-900/30 border border-${color}-700 text-${color}-400`}
                      >
                        <Icon className="w-5 h-5 mr-2" />
                        <span className="font-medium">{text}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interview Info */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-medium text-white mb-4">
                Interview Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <span className="text-white capitalize">
                    {detailsData.interview?.level || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white ">
                    {detailsData.interview?.duration || "N/A"} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">
                    {Array.isArray(detailsData.interview?.interviewType)
                      ? detailsData.interview?.interviewType.join(", ")
                      : detailsData.interview?.interviewType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">
                    {detailsData.interview?.createdAt
                      ? new Date(
                          detailsData.interview.createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-medium text-white mb-4">
                Candidate Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">
                    {detailsData.feedback?.candidateName || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">
                    {detailsData.feedback?.candidateEmail || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submitted:</span>
                  <span className="text-white">
                    {detailsData.feedback?.timestamp
                      ? new Date(
                          detailsData.feedback.timestamp
                        ).toLocaleString()
                      : "Not submitted"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <span className="text-white capitalize">
                    {detailsData.feedback?.jobPosition || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Card */}
            {detailsData.feedback && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-xl font-medium text-white mb-4">
                  Overall Score
                </h3>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Score",
                                value:
                                  detailsData.feedback?.feedback?.totalScore ||
                                  0,
                              },
                              {
                                name: "Remaining",
                                value:
                                  100 -
                                  (detailsData.feedback?.feedback?.totalScore ||
                                    0),
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell key="score" fill="#3b82f6" />
                            <Cell key="remaining" fill="#1f2937" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">
                        {detailsData.feedback?.feedback?.totalScore || 0}
                      </div>
                      <div className="text-gray-400 text-sm">out of 100</div>
                    </div>
                  </div>

                  <div
                    className={`text-sm font-medium px-3 py-1 rounded-full ${getScoreColor(
                      detailsData.feedback?.feedback?.totalScore || 0
                    )} text-white`}
                  >
                    {detailsData.feedback?.feedback?.totalScore >= 70
                      ? "Strong"
                      : detailsData.feedback?.feedback?.totalScore >= 40
                      ? "Average"
                      : "Poor"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendation & Summary */}
          {detailsData.feedback?.feedback && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendation */}
              {detailsData.feedback.feedback.recommendationMsg && (
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                  <h3 className="text-xl font-medium text-white mb-4">
                    Recommendation
                  </h3>
                  <div className="bg-gray-700/50 p-4 rounded-md">
                    <p className="text-gray-200 whitespace-pre-line">
                      {detailsData.feedback.feedback.recommendationMsg}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              {detailsData.feedback.feedback.summary && (
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                  <h3 className="text-xl font-medium text-white mb-4">
                    Summary
                  </h3>
                  <div className="bg-gray-700/50 p-4 rounded-md">
                    <p className="text-gray-200 whitespace-pre-line">
                      {detailsData.feedback.feedback.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Comments */}
          {detailsData.feedback?.comments && (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-medium text-white mb-4">
                Detailed Feedback
              </h3>
              <div className="bg-gray-700/50 p-4 rounded-md">
                <p className="text-gray-200 whitespace-pre-line">
                  {detailsData.feedback.comments}
                </p>
              </div>
            </div>
          )}

          {/* Skills Assessment */}
          {detailsData.feedback?.feedback?.rating && (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-medium text-white mb-4">
                Skills Assessment
              </h3>
              <div className="">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={getSkillsChartData()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip
                        formatter={(value) => [`${value}/10`, "Score"]}
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#4b5563",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Score">
                        {getSkillsChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
