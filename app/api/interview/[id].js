// pages/api/interview/[id].js
import clientPromise from "@/lib/utils/mongodb";

export default async function handler(req, res) {
  // Make sure we have the id parameter
  if (!req.query.id) {
    return res.status(400).json({
      success: false,
      error: "Missing interview ID"
    });
  }
  
  const { id } = req.query;
  console.log("Fetching details for interview ID:", id);
  
  try {
    const client = await clientPromise;
    
    // Connect to two different databases
    const db1 = client.db("interviewapp");
    const db2 = client.db("feedback_getter");

    // Fetch from both collections using the provided ID
    const interviewData = await db1.collection("interviews").findOne({ id: id });
    const feedbackData = await db2.collection("feedback_interview").findOne({ id: id });

    console.log("Found interview data:", interviewData ? "Yes" : "No");
    console.log("Found feedback data:", feedbackData ? "Yes" : "No");

    // For testing - if interviewData is null, create a dummy object
    const testData = interviewData || {
      id: id,
      jobPosition: "Test Position",
      level: "Senior",
      duration: 60,
      interviewType: ["Technical", "Behavioral"],
      createdAt: new Date().toISOString(),
      candidateAccessUrl: "/test-url"
    };

    res.status(200).json({
      success: true,
      interview: testData,
      feedback: feedbackData || null,
    });
  } catch (error) {
    console.error("Error fetching interview details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch interview details: " + error.message
    });
  }
}