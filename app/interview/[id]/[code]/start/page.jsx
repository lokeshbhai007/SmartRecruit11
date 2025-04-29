"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import InterviewParticipant from "@/app/components/InterviewParticipant";
import InterviewStatusCard from "@/app/components/InterviewStatusCard";
import InterviewStatusIndicator from "@/app/components/InterviewStatusIndicator";
import ControlButtons from "@/app/components/ControlButtons";
import InterviewAnimationStyles from "@/app/components/InterviewAnimationStyles";
import { useInterview } from "@/lib/context/InterviewContext";
import Vapi from "@vapi-ai/web";
import { toast } from "react-hot-toast";

export default function InterviewStartPage() {
  const params = useParams();
  const router = useRouter();
  const { id, code } = params;
  const vapiRef = useRef(null);
  
  // Timer reference for duration-based auto-ending
  const timerRef = useRef(null);
  const interviewStartTimeRef = useRef(null);

  const [candidateData, setCandidateData] = useState(null);
  const [listening, setListening] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState("waiting"); // waiting, active, completed
  const [aiSpeaking, setAiSpeaking] = useState(false); // Track if AI is currently speaking
  const [activeUser, setActiveUser] = useState(true); // Track who is active: true = candidate, false = AI
  const [conversation, setConversation] = useState([]); // Track conversation for feedback
  const [showReloadWarning, setShowReloadWarning] = useState(false); // State for reload warning modal
  const [remainingTime, setRemainingTime] = useState(null); // State for time remaining display

  // Use the interview context
  const {
    interviewData,
    setInterviewData,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
  } = useInterview();

  // Add useEffect to prevent page refresh/reload
  useEffect(() => {
    // Handler for beforeunload event
    const handleBeforeUnload = (e) => {
      if (interviewStatus === "active") {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "";
        return "Are you sure you want to leave? Your interview progress will be lost.";
      }
    };

    // Handler for popstate event (back/forward browser buttons)
    const handlePopState = (e) => {
      if (interviewStatus === "active") {
        // Prevent the navigation and show warning modal
        window.history.pushState(null, "", window.location.pathname);
        setShowReloadWarning(true);
        e.preventDefault();
      }
    };

    // Push a duplicate state to the history to catch back button press
    window.history.pushState(null, "", window.location.pathname);

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      // Clear any timers when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStatus]);

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await fetch(`/api/candidate-data/${id}?code=${code}`);
        const data = await response.json();

        if (data.success) {
          setCandidateData(data.candidate);
          console.log(data.candidate);
        } else {
          throw new Error(data.error || "Failed to load candidate data");
        }
      } catch (err) {
        console.error("Error fetching candidate data:", err);
        setError(`Failed to load interview: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id && code) {
      fetchCandidateData();
    }
  }, [id, code]);

  // Fetch interview questions if not already loaded
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        if (!interviewData) {
          const response = await fetch(`/api/interviews/${id}?code=${code}`);
          const data = await response.json();

          if (data.success) {
            setInterviewData(data.interview);
            console.log("Interview Questions:", data.interview);
          } else {
            throw new Error(data.error || "Failed to load interview data");
          }
        }
      } catch (err) {
        console.error("Error fetching interview data:", err);
        setError(`Failed to load interview questions: ${err.message}`);
      }
    };

    fetchInterviewData();
  }, [id, code, interviewData, setInterviewData]);

  // Initialize Vapi when interview data and candidate data are available
  useEffect(() => {
    if (interviewData && candidateData && !vapiRef.current) {
      initializeVapi();
    }
  }, [interviewData, candidateData]);

  // Start timer for duration-based auto-ending when interview becomes active
  useEffect(() => {
    if (interviewStatus === "active" && interviewData?.duration) {
      startInterviewTimer(interviewData.duration);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStatus, interviewData]);

  // Timer function to automatically end interview after duration
  const startInterviewTimer = (durationMinutes) => {
    if (!durationMinutes) return;
    
    // Convert minutes to milliseconds
    const durationMs = parseInt(durationMinutes) * 60 * 1000;
    interviewStartTimeRef.current = Date.now();
    const endTime = interviewStartTimeRef.current + durationMs;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial remaining time
    setRemainingTime(formatRemainingTime(durationMs));
    
    // Create interval to update remaining time and check for end condition
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        // Time's up - end the interview
        clearInterval(timerRef.current);
        setRemainingTime("00:00");
        toast.info("Interview time limit reached");
        autoEndInterview("Time limit reached");
      } else {
        // Update remaining time display
        setRemainingTime(formatRemainingTime(remaining));
      }
    }, 1000);
  };
  
  // Format remaining time as MM:SS
  const formatRemainingTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const initializeVapi = () => {
    // Create Vapi instance
    vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

    // Set up Vapi event listeners
    vapiRef.current.on("call-start", () => {
      console.log("Call has started.");
      toast("Call Connected...");
      setInterviewStatus("active");
    });

    vapiRef.current.on("speech-start", () => {
      console.log("Assistant speech has started.");
      setAiSpeaking(true);
      setListening(false);
      setActiveUser(false);
    });

    vapiRef.current.on("speech-end", () => {
      console.log("Assistant speech has ended.");
      setAiSpeaking(false);
      setListening(true);
      setActiveUser(true);
    });

    vapiRef.current.on("call-end", () => {
      console.log("Call has ended.");
      toast("Interview Ended...");
      setInterviewStatus("completed");
      // Generate feedback after the call ends
      GenerateFeedback();
    });

    vapiRef.current.on("message", (message) => {
      console.log("Message received:", message);

      // Check if the message contains conversation data
      if (message?.conversation && Array.isArray(message.conversation)) {
        // Update the conversation state with the full conversation history from Vapi
        setConversation(
          message.conversation.map((entry) => ({
            role: entry.from === "assistant" ? "ai" : "candidate",
            message: entry.content,
          }))
        );

        console.log("Conversation updated from message event");
      }
    });

    vapiRef.current.on("transcript", (transcript) => {
      // Add debug logging
      console.log("Transcript received:", transcript);

      // Make sure transcript has the expected structure before adding to conversation
      if (transcript && transcript.text && transcript.speaker) {
        // Store conversation for feedback generation
        setConversation((prev) => {
          const newConversation = [
            ...prev,
            {
              role: transcript.speaker === "assistant" ? "ai" : "candidate",
              message: transcript.text,
            },
          ];

          // Debug log the updated conversation
          console.log("Updated conversation:", newConversation);

          // Check for end interview phrases if transcript is from the assistant
          if (transcript.speaker === "assistant") {
            checkForEndPhrases(transcript.text);
          }

          return newConversation;
        });
      } else {
        console.error("Invalid transcript format:", transcript);
      }
    });

    // Start the interview automatically
    startVapiInterview();
  };

  // Check if AI's message contains ending phrases
  const checkForEndPhrases = (message) => {
    if (!message || interviewStatus !== "active") return;
    
    // List of phrases that indicate the interview is ending
    const endPhrases = [
      "thank you for your interview",
      "thank you for participating",
      "that concludes our interview",
      "that's all the questions i have",
      "this concludes our interview",
      "we've reached the end of our interview",
      "we've completed all the questions",
      "thanks for your time today",
      "i've asked all the questions"
    ];
    
    // Check if message contains any ending phrases
    const messageLower = message.toLowerCase();
    const containsEndPhrase = endPhrases.some(phrase => 
      messageLower.includes(phrase)
    );
    
    if (containsEndPhrase) {
      console.log("End phrase detected in AI response:", message);
      // Give a short delay to allow the AI to finish speaking before ending
      setTimeout(() => {
        autoEndInterview("AI concluded the interview");
      }, 3000);
    }
  };

  // Automatically end the interview
  const autoEndInterview = (reason) => {
    console.log(`Auto-ending interview: ${reason}`);
    
    // Only proceed if interview is still active
    if (interviewStatus !== "active" || !vapiRef.current) return;
    
    // Stop the Vapi call
    stopInterview();
    
    // Clean up timer if it exists
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Show notification to user
    toast.success(`Interview completed: ${reason}`);
    
    // Short delay to let Vapi wrap up processing
    setTimeout(() => {
      router.push(`/interview/${id}/${code}/completed`);
    }, 1500);
  };

  const startVapiInterview = () => {
    if (!vapiRef.current || !interviewData || !candidateData) return;

    // Format questions for the AI
    let questionList = "";
    if (interviewData.questions && interviewData.questions.length > 0) {
      questionList = interviewData.questions
        .map((q, idx) => `${idx + 1}. ${q.question}`)
        .join(", ");
    }

    const candidateName = candidateData?.name || "Candidate";
    const jobPosition = interviewData?.jobPosition || "the position";
    
    // If there's a duration, add it to the system prompt
    const durationInstruction = interviewData?.duration 
      ? `The interview should last approximately ${interviewData.duration} minutes. At the end, clearly say "Thank you for your interview" to signal completion.` 
      : "";

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${candidateName}, how are you? Ready for your interview on ${jobPosition}?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
        speed: 0.9, // Slower speech (e.g., 0.75 to 0.95 range for natural results)
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
"Hey there! Welcome to your ${jobPosition} interview. Let's get started with a few questions!"

Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below are the questions:
Questions: ${questionList}

If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"

Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"

Keep the conversation natural and engaging—use casual phrases like:
"Alright, next up..." or "Let's tackle a tricky one!"

${durationInstruction}

After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"

End on a positive note:
"Thanks for your time! That concludes our interview today."

Key Guidelines:
✅ Be friendly, engaging, and witty
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ Ensure the interview remains focused on the job requirements
✅ Always end with "Thank you for your interview" or similar closing phrase
`.trim(),
          },
        ],
      },
      onError: (error) => {
        console.error("Vapi error:", error);
        setError(`Interview error: ${error.message || "Unknown error"}`);
      },
    };

    // Start the call
    vapiRef.current.start(assistantOptions);
  };

  // Generate feedback using AI
  const GenerateFeedback = async () => {
    try {
      // Add debugging before sending the request
      console.log("Generating feedback with conversation data:", conversation);

      // Check if conversation is valid before sending
      if (!conversation || conversation.length === 0) {
        toast.error(
          "Unable to generate feedback: No conversation data available"
        );
        return;
      }

      // Include candidate data in the request
      const candidateName = candidateData?.name || "Unknown Candidate";
      const candidateEmail = candidateData?.email || "Not Provided";
      const jobPosition = interviewData?.jobPosition || "Not Specified";

      console.log(
        `Sending candidate data: Name=${candidateName}, Email=${candidateEmail}, Position=${jobPosition}`
      );

      const result = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: conversation,
          candidateName: candidateName,
          candidateEmail: candidateEmail,
          jobPosition: jobPosition,
        }),
      });

      const data = await result.json();
      console.log("Feedback API response:", data);

      if (data.success) {
        console.log("Feedback generated:", data.feedback);
        toast.success("Interview feedback generated successfully");
        // Process feedback data if needed
        // Store it in context or state for use in completed page
      } else {
        console.error("Failed to generate feedback:", data.error);
        toast.error(`Failed to generate feedback: ${data.error}`);
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error(`Error generating feedback: ${error.message}`);
    }
  };

  const toggleMic = () => {
    // Update the UI state
    setIsMicEnabled(!isMicEnabled);
  
    // Mute/unmute the Vapi call if active
    if (vapiRef.current && interviewStatus === "active") {
      try {
        if (isMicEnabled) {
          // Try to mute audio input - check for any available method in the Vapi SDK
          if (typeof vapiRef.current.stopRecording === 'function') {
            vapiRef.current.stopRecording();
          } else if (typeof vapiRef.current.stopAudioInput === 'function') {
            vapiRef.current.stopAudioInput();
          } else if (typeof vapiRef.current.setMuted === 'function') {
            vapiRef.current.setMuted(true);
          }
          // Update UI state regardless
          setListening(false);
        } else {
          // Try to unmute audio input - check for any available method in the Vapi SDK
          if (typeof vapiRef.current.startRecording === 'function') {
            vapiRef.current.startRecording();
          } else if (typeof vapiRef.current.startAudioInput === 'function') {
            vapiRef.current.startAudioInput();
          } else if (typeof vapiRef.current.setMuted === 'function') {
            vapiRef.current.setMuted(false);
          }
          // Update UI state regardless
          setListening(true);
        }
      } catch (error) {
        console.error("Error toggling microphone:", error);
        // Still update the UI even if the API call fails
        setListening(!isMicEnabled);
        
        // Optionally show a toast notification about the mic issue
        toast.error("Could not change microphone state. Please refresh the page.");
      }
    }
  };

  const stopInterview = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const endInterview = () => {
    setShowConfirmationModal(true);
  };

  const confirmEndInterview = () => {
    // Stop the Vapi call if active
    stopInterview();

    // Generate feedback before redirecting
    if (conversation && conversation.length > 0) {
      console.log("Ending interview with conversation:", conversation);
      GenerateFeedback();
    } else {
      console.warn("No conversation data available for feedback generation");
    }

    // Short delay before redirect to allow feedback generation to start
    setTimeout(() => {
      router.push(`/interview/${id}/${code}/completed`);
    }, 500);
  };

  const cancelEndInterview = () => {
    setShowConfirmationModal(false);
  };

  // Handler for reload warning modal
  const dismissReloadWarning = () => {
    setShowReloadWarning(false);
  };

  // Get the candidate initial
  const candidateInitial = candidateData?.name?.charAt(0) || "C";

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Main container with fixed width and height */}
      <div className="w-full max-w-4xl bg-gray-800/60 rounded-xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gray-800/80 p-3 mb-4 border-b border-gray-700">
          <div className="max-w-full mx-auto">
            <h1 className="text-5xl py-2 font-bold text-center">
              <span className="text-white">Smart</span>
              <span className="text-blue-500">Recruit</span>
            </h1>
            <p className="text-white text-center pb-3 text-sm mt-1">
              "Welcome! The interview has started. Feel free to speak naturally
              — the AI interviewer is here to assist you throughout."
            </p>
            
            {/* Time remaining display - only show when interview is active */}
            {interviewStatus === "active" && interviewData?.duration && (
              <div className="text-center mt-1">
                <span className="bg-blue-800 px-3 py-1 rounded-full text-white text-sm font-medium">
                  Time Remaining: {remainingTime || "Loading..."}
                </span>
              </div>
            )}
          </div>
        </div>
  
        <div className="p-6">
          {/* Interview Participants UI Component - using our custom component */}
          <div className="flex justify-between items-center mb-6 mx-auto max-w-2xl">
            {/* AI Interviewer */}
            <InterviewParticipant
              isActive={!activeUser}
              isAI={true}
              isSpeaking={aiSpeaking}
              name="AI Interviewer"
              initial="A"
            />
  
            {/* Divider Line */}
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
  
            {/* Candidate */}
            <InterviewParticipant
              isActive={activeUser}
              isAI={false}
              isSpeaking={false}
              name={candidateData?.name || "Candidate"}
              initial={candidateInitial}
            />
          </div>
  
          {/* Conversation Container */}
          <div className="bg-gray-900/80 rounded-lg p-4 mb-5 shadow-inner">
            {/* Interview Status Card */}
            <InterviewStatusCard 
              listening={listening} 
              jobPosition={interviewData?.jobPosition} 
              candidateName={candidateData?.name} 
            />
  
            {/* Interview Status Indicator */}
            <InterviewStatusIndicator status={interviewStatus} />
          </div>
  
          {/* Control buttons */}
          <ControlButtons
            isMicEnabled={isMicEnabled}
            toggleMic={toggleMic}
            endInterview={endInterview}
          />
        </div>
      </div>
  
      {/* Status message for interview state */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-500 text-white p-2 rounded-lg text-sm shadow-lg">
          {error}
        </div>
      )}
  
      {/* Confirmation Modal for ending interview */}
      {showConfirmationModal && (
        <ConfirmationModal
          title="End Interview"
          message="Are you sure you want to end this interview? This action cannot be undone."
          confirmText="Yes, End Interview"
          cancelText="No, Continue"
          onConfirm={confirmEndInterview}
          onCancel={cancelEndInterview}
        />
      )}
      
      {/* Reload Warning Modal */}
      {showReloadWarning && (
        <ConfirmationModal
          title="Warning: Interview in Progress"
          message="Please don't refresh or navigate away from this page. Your interview is active and you may lose all progress."
          confirmText="Continue Interview"
          onConfirm={dismissReloadWarning}
          showCancel={false}
        />
      )}
  
      {/* Add the separated animation styles component */}
      <InterviewAnimationStyles />
    </div>
  );
}