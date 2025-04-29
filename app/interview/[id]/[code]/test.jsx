import Vapi from "@vapi-ai/web";

function StartInterview() {
  const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

  useEffect(() => {
    interviewInfo && startCall();
  }, [interviewInfo]);

  const startCall = () => {
    let questionList;
    interviewInfo?.interviewData?.questionList.forEach((question, index) => (
      questionList = question + ', ' + questionList
    ));

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: "Hi "+candidateData?.name || Lokesh +", how are you? Ready for your interview on "+interviewData?.jobPosition+"?",
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
    You are an AI voice assistant conducting interviews.
    Your job is to ask candidates provided interview questions, assess their responses.
    Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
    "Hey there! Welcome to your `+interviewData?.jobPosition+` interview. Let’s get started with a few questions!"
    Ask one question at a time and wait for the candidate’s response before proceeding. Keep the questions clear and concise. Below are the questions:
    Questions: `+questionList+`
    
    If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
    "Need a hint? Think about how React tracks component updates!"
    
    Provide brief, encouraging feedback after each answer. Example:
    "Nice! That’s a solid answer."
    "Hmm, not quite! Want to try again?"
    
    Keep the conversation natural and engaging—use casual phrases like:
    "Alright, next up..." or "Let’s tackle a tricky one!"
    
    After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
    "That was great! You handled some tough questions well. Keep sharpening your skills!"
    
    End on a positive note:
    "Thanks for chatting! Hope to see you crushing projects soon!"
    
    Key Guidelines:
    ✅ Be friendly, engaging, and witty
    ✅ Keep responses short and natural, like a real conversation
    ✅ Adapt based on the candidate’s confidence level
    ✅ Ensure the interview remains focused on React
    `.trim(),
          },
        ],
      },
    };
    
    vapi.start(assistantOptions)

  }

  const stopInterview = () => {
    vapi.stop();
  }


  vapi.on("call-start", () => {
    console.log("Call has started.");
    toast('Call Connected...')
  });

  vapi.on("speech-start", () => {
    console.log("Assistant speech has started.");
    setActiveUser(false);
  });
  
  vapi.on("speech-end", () => {
    console.log("Assistant speech has ended.");
    setActiveUser(true);
  }); 

  vapi.on("call-end", () => {
    console.log("Call has ended.");
    toast('Interview Ended...')
  });




}


vapi.on("message", (message) => {
  console.log(message?.conversation);
  setConversation(message?.conversation);
});

const GenerateFeedback = async () => {
  const result = await axios.post('/api/ai-feedback', {
    conversation: conversation
  });
  console.log(result?.data);
  const Content = result.data.content;
  const FINAL_CONTENT = Content.replace('```json', '').replace('```', '');
  console.log(FINAL_CONTENT);
  // Save to Database
};



const FEEDBACK_PROMPT = `
{{conversation}}

Based on this interview conversation between the assistant and the user, generate structured feedback for the user's performance.

🎯 Your task:
1. Provide ratings out of 10 in the following categories:
   - Technical Skills
   - Communication
   - Problem Solving
   - Experience

2. Write a summary of the candidate's performance in **3 concise lines**.

3. Clearly indicate whether the candidate is **Recommended** or **Not Recommended** for hire.

4. Add a one-line recommendation message supporting your decision.

📦 Format your response in strict JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": <1–10>,
      "communication": <1–10>,
      "problemSolving": <1–10>,
      "experience": <1–10>
    },
    "summary": "<3-line summary>",
    "recommendation": "Recommended" | "Not Recommended",
    "recommendationMsg": "<short reason or insight>"
  }
}
`;




export async function POST(req) {
    const { conversation } = await req.json();
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace('{{conversation}}', conversation);

    // Further code to handle the FINAL_PROMPT, 
    // such as sending it to an gemini api AI model or storing it in a database 
    // of MONGODB_URI as name of collection feedback_interview and also first colsole.log it 
}