// app/api/interviews/route.js

// Add an API endpoint to save the interview to MongoDB:

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/mongodb';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

export async function POST(request) {
  try {
    const interview = await request.json();
    
    // Create a unique ID for the interview if it doesn't have one
    if (!interview.id || interview.id.startsWith('interview_')) {
      interview.id = uuidv4();
    }
    
    // Add created timestamp if not present
    if (!interview.createdAt) {
      interview.createdAt = new Date().toISOString();
    }
    
    // Generate a unique URL for candidate access
    const candidateAccessCode = uuidv4().substring(0, 8);
    interview.candidateAccessCode = candidateAccessCode;
    interview.candidateAccessUrl = `/interview/${interview.id}/${candidateAccessCode}`;
    
    const client = await clientPromise;
    const db = client.db("interviewapp");
    
    // Insert the interview into MongoDB
    const result = await db.collection("interviews").insertOne(interview);
    
    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        interviewId: interview.id,
        candidateAccessUrl: interview.candidateAccessUrl,
        candidateAccessCode: interview.candidateAccessCode
      });
    } else {
      throw new Error('Failed to save interview to database');
    }
    
  } catch (error) {
    console.error("Error saving interview:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save interview'
    }, { status: 500 });
  }
}

// Add a GET endpoint to retrieve all interviews
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("interviewapp");
    
    const interviews = await db.collection("interviews")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error("Error retrieving interviews:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve interviews'
    }, { status: 500 });
  }
}