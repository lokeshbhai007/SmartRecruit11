// lib/utils/gemini.js - Modified to better handle interview types
export async function generateQuestions(formData) {
    const { jobPosition, jobDescription, duration, level, interviewType } = formData;
    
    const prompt = `You are an expert technical interviewer.
  Based on the following inputs, generate a well-structured list of high-quality interview questions:
  Job Title: ${jobPosition}
  Job Description: ${jobDescription}
  Interview Duration: ${duration}
  Interview Type: ${interviewType}
  Skill Level: ${level}
  
  📄 Your task:
  - Analyze the job description to identify key responsibilities, required skills, and expected experience.
  - Generate a list of interview questions specifically for the interview type: ${interviewType}.
  - Adjust the number and depth of questions to match the interview duration.
  - Ensure the questions match the tone and structure of a real-life ${interviewType} interview.
  - Ensure the questions assess the candidate's skills at a ${level} level.
  
  IMPORTANT: Return your response in the following JSON format ONLY with no additional text:
  {
    "interviewQuestions": [
      {
        "question": "Your question here?",
        "type": "${interviewType}"
      }
    ]
  }
  
  🎯 The goal is to create structured, relevant, and time-optimized ${interviewType} interview questions for a ${jobPosition} role.`;
  
    try {
      console.log(`Sending request to Gemini API for ${interviewType} questions...`);
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text was generated');
      }
  
      console.log(`Raw response for ${interviewType}:`, generatedText);
  
      // Try to parse the entire response as JSON first
      try {
        const parsedData = JSON.parse(generatedText);
        if (parsedData.interviewQuestions) {
          return parsedData.interviewQuestions;
        }
      } catch (e) {
        console.log("Failed to parse entire response as JSON, trying to extract JSON...");
      }
  
      // Try different JSON extraction patterns
      let jsonMatch;
      
      // Pattern 1: Match with variable assignment
      jsonMatch = generatedText.match(/interviewQuestions\s*=\s*(\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Pattern 2: Match JSON object with interviewQuestions property
      jsonMatch = generatedText.match(/\{\s*"interviewQuestions"\s*:\s*(\[[\s\S]*\])\s*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Pattern 3: Match any array in the text
      jsonMatch = generatedText.match(/\[\s*\{\s*"question"[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If we can't extract JSON, generate fallback questions
      console.warn(`Could not extract JSON from Gemini response for ${interviewType}, generating fallback questions`);
      
      const fallbackQuestions = generateFallbackQuestions(formData);
      return fallbackQuestions;
      
    } catch (error) {
      console.error(`Error in generateQuestions for ${interviewType}:`, error);
      return generateFallbackQuestions(formData);
    }
  }
  
  // Fallback questions if API fails - updated to handle specific interview types
  function generateFallbackQuestions(formData) {
    const { jobPosition, interviewType, level } = formData;
    
    // Common questions for all types
    const commonQuestions = [
      {
        question: `What makes you interested in this ${jobPosition} position?`,
        type: "general"
      },
      {
        question: "Can you walk me through your relevant experience for this role?",
        type: "experience"
      }
    ];
    
    // Type-specific questions
    const typeQuestions = {
      technical: [
        {
          question: `Describe a challenging technical problem you've solved in your previous role.`,
          type: "technical"
        },
        {
          question: "What development methodologies are you familiar with?",
          type: "technical"
        },
        {
          question: "How do you stay updated with the latest industry trends?",
          type: "technical"
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time when you had to work under pressure to meet a deadline.",
          type: "behavioral"
        },
        {
          question: "How do you handle disagreements with team members?",
          type: "behavioral"
        },
        {
          question: "Describe a situation where you had to adapt to a significant change at work.",
          type: "behavioral"
        }
      ],
      experience: [
        {
          question: "What was your most significant achievement in your last role?",
          type: "experience"
        },
        {
          question: "How have your previous experiences prepared you for this role?",
          type: "experience"
        },
        {
          question: "Tell me about a project where you took on a leadership role.",
          type: "experience"
        }
      ],
      "problem-solving": [
        {
          question: "How do you approach solving complex problems?",
          type: "problem-solving"
        },
        {
          question: "Describe a situation where you had to think outside the box to solve an issue.",
          type: "problem-solving"
        },
        {
          question: "What strategies do you use when faced with ambiguous requirements?",
          type: "problem-solving"
        }
      ],
      leadership: [
        {
          question: "How do you motivate team members during challenging projects?",
          type: "leadership"
        },
        {
          question: "Describe your approach to delegating tasks and responsibilities.",
          type: "leadership"
        },
        {
          question: "How do you handle conflicts within your team?",
          type: "leadership"
        }
      ]
    };
    
    // Return type-specific questions if available, otherwise return common questions
    return interviewType && typeQuestions[interviewType] 
      ? [...commonQuestions, ...typeQuestions[interviewType]]
      : [...commonQuestions, ...typeQuestions.technical, ...typeQuestions.behavioral];
  }