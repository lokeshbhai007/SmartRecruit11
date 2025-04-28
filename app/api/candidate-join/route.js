// app/api/candidate-join/route.js
//save the join candidate data for showing You have already taken this interview
// //join the interview first page ensure one time interview

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/mongodb';

export async function POST(request) {
  try {
    const { interviewId, candidateCode, name, email } = await request.json();
    
    // Validate request data
    if (!interviewId || !candidateCode || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Check if this candidate has already taken this interview
    const existingEntry = await db.collection('join_candidate_data').findOne({
      interviewId,
      email: email.toLowerCase(),
    });
    
    if (existingEntry) {
      return NextResponse.json(
        { success: false, alreadyTaken: true, message: 'You have already taken this interview' },
        { status: 400 }
      );
    }
    
    // Create new entry
    const result = await db.collection('join_candidate_data').insertOne({
      interviewId,
      candidateCode,
      name,
      email: email.toLowerCase(),
      joinedAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Candidate registered successfully',
      candidateId: result.insertedId,
    });
    
  } catch (error) {
    console.error('Error in candidate-join API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}