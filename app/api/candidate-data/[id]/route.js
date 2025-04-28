import { NextResponse } from 'next/server';
import clientPromise from '@/lib/utils/mongodb';

export async function GET(request, { params }) {
  try {
    // Await params to ensure it's resolved before accessing properties
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!id || !code) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Get candidate data
    const candidateData = await db.collection('join_candidate_data').findOne({
      interviewId: id,
      candidateCode: code
    });
    
    if (!candidateData) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    // Get interview data for additional context if needed
    const interviewData = await db.collection('interviews').findOne({
      _id: id
    });
    
    return NextResponse.json({
      success: true,
      candidate: {
        name: candidateData.name,
        email: candidateData.email,
        joinedAt: candidateData.joinedAt,
        interviewPosition: interviewData?.jobPosition || 'Full Stack Developer'
      }
    });
    
  } catch (error) {
    console.error('Error in candidate-data API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}