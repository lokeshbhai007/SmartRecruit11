// Add an API endpoint to get a specific interview:


// app/api/interviews/[id]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/mongodb';

export async function GET(request, context) {
  try {
    // Await context.params before accessing its properties
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    console.log('Fetching interview:', { id, code });
    
    // Validate parameters
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Interview ID is required'
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("interviewapp");  
    
    // Find the interview
    const interview = await db.collection("interviews").findOne({ id });
    
    if (!interview) {
      console.log('Interview not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Interview not found'
      }, { status: 404 });
    }
    
    console.log('Interview found:', interview.id);
    
    // If code is provided, validate it matches the candidate access code
    if (code && interview.candidateAccessCode !== code) {
      console.log('Invalid access code provided');
      return NextResponse.json({
        success: false,
        error: 'Invalid access code'
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error("Error retrieving interview:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve interview'
    }, { status: 500 });
  }
}