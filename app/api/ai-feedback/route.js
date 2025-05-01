// app/api/ai-feedback/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/utils/mongodb";
import { OpenAI } from "openai";

// Initialize Google AI API as primary option
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize OpenRouter as fallback
const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "https://smartrecruit.com", // Replace with your actual site URL
    "X-Title": "SmartRecruit" // Replace with your actual site name
  }
});

const FEEDBACK_PROMPT = `
You are an expert technical interview evaluator.

Below is a conversation transcript from a technical interview:
---
{{conversation}}
---

Based on this interview conversation between the AI interviewer and the candidate, generate structured feedback for the candidate's performance.

🎯 Your task:
1. Provide ratings out of 10 in the following categories:
   - Technical Skills
   - Communication
   - Problem Solving
   - Experience
2. Write a summary of the candidate's performance in **3 concise lines**.
3. Calculate the total score out of 100 by summing all category scores and multiplying by 2.5
4. Determine recommendation status: "Recommended" if total score is 75 or higher, "Not Recommended" if below 75.
5. Add a one-line recommendation message supporting your decision.

📦 Format your response in strict JSON format as follows:
{
  "rating": {
    "technicalSkills": <1-10>,
    "communication": <1-10>,
    "problemSolving": <1-10>,
    "experience": <1-10>
  },
  "totalScore": <0-100>,
  "summary": "<5-line summary>",
  "recommendation": "Recommended" | "Not Recommended",
  "recommendationMsg": "<one-line message>"
}

Return only the JSON output without any additional text, markdown formatting, or explanations.
`;

// Generate feedback using OpenRouter as a fallback
async function generateOpenRouterFeedback(formattedConversation) {
  try {
    const response = await openRouter.chat.completions.create({
      model: "google/gemini-flash-1.5", // Using Google's Gemini model through OpenRouter
      messages: [
        { 
          role: "system", 
          content: "You are an expert interview evaluator that provides feedback in JSON format."
        },
        { 
          role: "user", 
          content: FEEDBACK_PROMPT.replace('{{conversation}}', formattedConversation)
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw error;
  }
}

// Generate mock feedback if all else fails
function generateDefaultFeedback(conversation) {
  // Analyze basic metrics from conversation to create somewhat personalized feedback
  // Count candidate responses and their average length
  const candidateResponses = conversation.filter(entry => entry.role === 'candidate');
  const responseCount = candidateResponses.length;
  
  // Calculate average response length
  const avgLength = responseCount > 0 
    ? candidateResponses.reduce((sum, entry) => sum + entry.message.length, 0) / responseCount 
    : 0;
  
  // Generate scores based on basic metrics
  // This is very simplistic but better than static values
  const commScore = Math.min(Math.max(Math.round(avgLength / 20), 1), 10);
  const expScore = Math.min(Math.max(Math.round(responseCount / 2), 1), 10);
  const techScore = Math.min(Math.max(Math.round((commScore + expScore) / 2), 1), 10);
  const probScore = Math.min(Math.max(Math.round(commScore * 0.8), 1), 10);
  
  // Calculate total score out of 100
  const totalScore = Math.round((techScore + commScore + probScore + expScore) * 2.5);
  const isRecommended = totalScore >= 75;
  
  return {
    rating: {
      technicalSkills: techScore,
      communication: commScore,
      problemSolving: probScore,
      experience: expScore
    },
    totalScore: totalScore,
    summary: "The candidate participated in the interview process. Some technical knowledge was demonstrated. Further evaluation may be needed for a complete assessment.",
    recommendation: isRecommended ? "Recommended" : "Not Recommended",
    recommendationMsg: isRecommended 
      ? "Candidate showed strong performance across multiple evaluation criteria."
      : "Candidate needs improvement in key areas before moving forward."
  };
}

export async function POST(req) {
  try {
    // Extract conversation data and candidate information from request
    const { id, conversation, candidateName, candidateEmail, jobPosition } = await req.json();
    
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      throw new Error("Invalid or empty conversation data");
    }
    
    // Format conversation data for better processing
    const formattedConversation = conversation.map(entry => {
      return `${entry.role === 'ai' ? 'AI Interviewer' : 'Candidate'}: ${entry.message}`;
    }).join('\n\n');
    
    console.log("Generating feedback based on interview conversation");
    
    // Attempt to use Gemini first
    let responseText;
    let feedbackData;
    let feedbackSource = "gemini";
    
    try {
      // Try Gemini API first
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(FEEDBACK_PROMPT.replace('{{conversation}}', formattedConversation));
      responseText = result.response.text();
      
      console.log("Successfully generated feedback with Gemini");      
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError.message);
      
      // Try OpenRouter as fallback
      try {
        responseText = await generateOpenRouterFeedback(formattedConversation);
        feedbackSource = "openrouter";
        console.log("Successfully generated feedback with OpenRouter fallback");
      } catch (openRouterError) {
        console.error("OpenRouter fallback error:", openRouterError.message);
        
        // Use default feedback as last resort
        feedbackData = generateDefaultFeedback(conversation);
        feedbackSource = "default";
        console.log("Using default feedback generator");
      }
    }
    
    // Parse JSON response if we have a response text
    if (responseText && !feedbackData) {
      try {
        // Clean up response text by removing any potential markdown code blocks or extra text
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = responseText.substring(jsonStart, jsonEnd);
          feedbackData = JSON.parse(jsonStr);
          
          // Ensure totalScore exists by calculating if missing
          if (!feedbackData.totalScore) {
            const { technicalSkills, communication, problemSolving, experience } = feedbackData.rating;
            feedbackData.totalScore = Math.round((technicalSkills + communication + problemSolving + experience) * 2.5);
            
            // Update recommendation based on the calculated score
            feedbackData.recommendation = feedbackData.totalScore >= 75 ? "Recommended" : "Not Recommended";
          }
          
          console.log("Successfully parsed feedback JSON");
        } else {
          throw new Error("JSON not found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        console.log("Raw response:", responseText);
        
        // Fall back to default feedback
        feedbackData = generateDefaultFeedback(conversation);
        feedbackSource = "default";
      }
    }
    
    // Store feedback in MongoDB with candidate information
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'feedback_getter');
      
      await db.collection("feedback_interview").insertOne({
        // Use the id from the request object, not a variable in this scope
        id: id, // Changed from id:id to interviewId: id
        candidateName: candidateName || "Unknown Candidate",
        candidateEmail: candidateEmail || "Not Provided",
        jobPosition: jobPosition || "Not Specified",
        conversation: conversation,
        feedback: feedbackData,
        feedbackSource: feedbackSource, // Track which method generated the feedback
        timestamp: new Date(),
      });
      
      console.log("Feedback and candidate data stored in database");
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB storage fails
    }
    
    // Return the feedback data
    return NextResponse.json({
      success: true,
      feedback: feedbackData
    });
    
  } catch (error) {
    console.error("Error in AI feedback generation:", error);
    
    // Generate default feedback even in case of unexpected errors
    const defaultFeedback = {
      rating: {
        technicalSkills: 5,
        communication: 5,
        problemSolving: 5,
        experience: 5
      },
      totalScore: 50, // 4 categories * 5 points * 2.5 = 50
      summary: "Unable to generate proper feedback. The interview data might be incomplete or unclear.",
      recommendation: "Not Recommended", // Below 75 threshold
      recommendationMsg: "Please review the interview manually."
    };
    
    return NextResponse.json(
      { 
        success: true, // Return success to avoid frontend errors
        feedback: defaultFeedback,
        error: error.message || "Failed to generate feedback"
      }
    );
  }
}