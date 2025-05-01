// pages/api/interviews.js
import clientPromise from "@/lib/utils/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("interviewapp");
    
    // Fetch all interviews for the dashboard
    const interviews = await db.collection("interviews")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json({ 
      success: true,
      interviews 
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch interviews" 
    });
  }
}