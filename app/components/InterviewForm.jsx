// app/components/InterviewForm.jsx - Updated to handle multiple interview types
"use client";
import { useState } from "react";
import Input from "./ui/Input";
import TextArea from "./ui/TextArea";
import Button from "./ui/Button";
import DurationSelector from "./DurationSelector";
import LevelSelector from "./LevelSelector";
import InterviewTypeSelector from "./InterviewTypeSelector";
import ProgressBar from "./ui/ProgressBar";

export default function InterviewForm({ onQuestionsGenerated }) {
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDescription: "",
    duration: "",
    level: "",
    interviewType: [], // Initialize as an empty array for multiple selections
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id.replace("interview-", "")]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one interview type is selected
    if (formData.interviewType.length === 0) {
      setError("Please select at least one interview type");
      return;
    }

    setLoading(true);
    setError("");
    setProgress(10);

    try {
      // Simulate initial progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);

      // Call API to generate questions
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.success) {
        // Send the interview data to the parent component
        onQuestionsGenerated(data.interview);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        `Failed to generate interview questions: ${
          err.message || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">
        Create New Interview
      </h2>

      {loading && (
        <div className="mb-6">
          <ProgressBar progress={progress} />
          <p className="text-gray-300 text-sm">Generating questions...</p>
        </div>
      )}

      <Input
        label="Job Position"
        id="interview-jobPosition"
        value={formData.jobPosition}
        onChange={handleChange}
        placeholder="e.g., Senior Web Developer"
        required
        disabled={loading}
      />

      <TextArea
        label="Job Description"
        id="interview-jobDescription"
        value={formData.jobDescription}
        onChange={handleChange}
        placeholder="Enter the detailed job description here..."
        rows={6}
        required
        disabled={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DurationSelector
          value={formData.duration}
          onChange={handleChange}
          disabled={loading}
        />

        <LevelSelector
          value={formData.level}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div className="">
        <InterviewTypeSelector
          value={formData.interviewType}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded my-4">
          {error}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          disabled={loading || formData.interviewType.length === 0}
          className="w-full py-3 text-lg"
        >
          {loading ? "Generating Questions..." : "Generate Questions"}
        </Button>
      </div>
    </form>
  );
}
