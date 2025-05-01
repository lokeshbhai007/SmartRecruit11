// app/api/ai-feedback/[id]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/mongodb';

export async function GET(request) {
  try {
    // Extract the ID from the URL path
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const id = segments[segments.length - 1];
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Interview ID is required'
      }, { status: 400 });
    }
    
    console.log('Fetching feedback for interview:', id);
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'feedback_getter');
    
    // Find the feedback record for this interview
    // Try multiple collection names and query patterns
    let feedbackRecord = await db.collection("feedback_interview").findOne({ id });
    
    // If not found, try with interviewId field
    if (!feedbackRecord) {
      feedbackRecord = await db.collection("feedback_interview").findOne({ interviewId: id });
    }
    
    // If still not found, try different collection names
    if (!feedbackRecord) {
      feedbackRecord = await db.collection("interviews_feedback").findOne({ 
        $or: [{ id }, { interviewId: id }] 
      });
    }
    
    if (!feedbackRecord) {
      // As a last resort, try to find the feedback inside the interviews collection
      const interview = await db.collection("interviews").findOne({ id });
      if (interview && interview.feedback) {
        feedbackRecord = {
          id,
          feedback: interview.feedback,
          timestamp: interview.feedbackTimestamp || interview.updatedAt || interview.createdAt
        };
      } else {
        console.log('Feedback not found for interview:', id);
        return NextResponse.json({
          success: false,
          error: 'Feedback not found for this interview'
        }, { status: 404 });
      }
    }
    
    console.log('Feedback found for interview:', id);
    
    // Return all relevant data including candidate information
    return NextResponse.json({
      success: true,
      feedback: feedbackRecord.feedback,
      feedbackSource: feedbackRecord.feedbackSource || null,
      timestamp: feedbackRecord.timestamp || null,
      candidateData: {
        name: feedbackRecord.candidateName || '',
        email: feedbackRecord.candidateEmail || '',
        jobPosition: feedbackRecord.jobPosition || ''
      }
    });
    
  } catch (error) {
    console.error("Error retrieving interview feedback:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve interview feedback'
    }, { status: 500 });
  }
}