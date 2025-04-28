// app/api/generate-questions/route.js
import { NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/utils/gemini';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = ['jobPosition', 'jobDescription', 'duration', 'level', 'interviewType'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    // Check if interviewType is an array with at least one element
    if (!Array.isArray(formData.interviewType) || formData.interviewType.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Please select at least one interview type'
      }, { status: 400 });
    }
    
    // Determine number of questions based on duration
    let questionCount;
    switch (formData.duration) {
      case '5': questionCount = 3; break;
      case '10': questionCount = 5; break;
      case '15': questionCount = 7; break;
      case '30': questionCount = 12; break;
      case '45': questionCount = 15; break;
      case '60': questionCount = 20; break;
      default: questionCount = 5;
    }
    
    console.log(`Generating ${questionCount} questions for a ${formData.duration} minute interview...`);
    
    try {
      // Generate questions using Gemini API for each selected interview type
      const allQuestions = [];
      
      // Calculate how many questions to generate per type
      const typesCount = formData.interviewType.length;
      const questionsPerType = Math.ceil(questionCount / typesCount);
      
      // Generate questions for each interview type
      for (const type of formData.interviewType) {
        const typeFormData = {
          ...formData,
          interviewType: type
        };
        
        const typeQuestions = await generateQuestions(typeFormData);
        
        // Take a proportional number of questions from each type
        const typeQuestionsLimited = typeQuestions.slice(0, questionsPerType);
        allQuestions.push(...typeQuestionsLimited);
      }
      
      // Ensure the total doesn't exceed the desired question count
      const limitedQuestions = allQuestions.slice(0, questionCount);
      
      return NextResponse.json({
        success: true,
        interview: {
          id: 'interview_' + Date.now(),
          ...formData,
          questions: limitedQuestions,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in question generation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate interview questions'
    }, { status: 500 });
  }
}