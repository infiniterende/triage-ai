"use client";

import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import "../styles/VoiceAgent.css";

import { MessageProps } from "../types";

// const Message = ({ type, text }: MessageProps) => {
//   return (
//     <div className="message">
//       <strong className={`message-${type}`}>
//         {type === "agent" ? "Agent: " : "You: "}
//       </strong>
//       <span className="message-text">{text}</span>
//     </div>
//   );
// };

// const VoiceMode = ({ name }: { name: string }) => {
//   const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
//   const localParticipant = useLocalParticipant();
//   const { segments: userTranscriptions } = useTrackTranscription({
//     publication: localParticipant.microphoneTrack,
//     source: Track.Source.Microphone,
//     participant: localParticipant.localParticipant,
//   });

//   const [messages, setMessages] = useState<MessageProps[]>([]);
//   console.log(messages);
//   const [token, setToken] = useState<string>();

//   useEffect(() => {
//     console.log("Mic track:", localParticipant.microphoneTrack);
//   }, [localParticipant.microphoneTrack]);

//   useEffect(() => {
//     const allMessages = [
//       ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),
//       ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),
//     ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
//     setMessages(allMessages);
//   }, [agentTranscriptions, userTranscriptions]);

//   useEffect(() => {
//     const fetchToken = async () => {
//       const res = await fetch(
//         `http://localhost:8000/getToken?name=${encodeURIComponent(name)}`
//       );
//       const data = await res.json();
//       setToken(data.token);
//     };
//     fetchToken();
//   }, []);

//   return (
//     <div className="voice-assistant-container">
//       <div className="visualizer-container">
//         <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
//       </div>
//       <div className="control-section">
//         <LiveKitRoom
//           serverUrl={process.env.NEXT_PUBLIC_API_URL}
//           token={token}
//           connect={true}
//           audio={true}
//           video={false}
//         ></LiveKitRoom>
//         <VoiceAssistantControlBar />
//         <div className="conversation">
//           {messages.map((msg, index) => (
//             <Message key={msg.id || index} type={msg.type} text={msg.text} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VoiceMode;

// // import { useState, useEffect, useRef } from "react";

// // import type {
// //   ConversationMessage,
// //   TranscriptionResponse,
// //   ChatResponse,
// //   UserResponse,
// //   AssessmentResult,
// //   VoiceModeProps,
// //   CustomMediaRecorder,
// // } from "../types";

// // enum Role {
// //   Assistant = "assistant",
// //   User = "user",
// // }

// // const API_BASE_URL = "http://localhost:8000";

// // export default function VoiceMode({ sessionId, onComplete }: VoiceModeProps) {
// //   const [isRecording, setIsRecording] = useState<boolean>(false);
// //   const [conversation, setConversation] = useState<ConversationMessage[]>([]);
// //   const [currentMessage, setCurrentMessage] = useState<string>("");
// //   const [isProcessing, setIsProcessing] = useState<boolean>(false);
// //   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
// //     null
// //   );
// //   const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
// //   const [isPlaying, setIsPlaying] = useState<boolean>(false);
// //   const [assessmentComplete, setAssessmentComplete] = useState<boolean>(false);
// //   const [responses, setResponses] = useState<UserResponse[]>([]);

// //   const audioRef = useRef<HTMLAudioElement>(null);
// //   const chatContainerRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     // Initialize voice chat with greeting
// //     initializeVoiceChat();
// //     setupMediaRecorder();
// //   }, []);

// //   useEffect(() => {
// //     // Auto-scroll chat to bottom
// //     if (chatContainerRef.current) {
// //       chatContainerRef.current.scrollTop =
// //         chatContainerRef.current.scrollHeight;
// //     }
// //   }, [conversation]);

// //   const setupMediaRecorder = async () => {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //       const recorder = new MediaRecorder(stream);

// //       recorder.ondataavailable = (event) => {
// //         if (event.data.size > 0) {
// //           setAudioChunks((prev: Blob[]) => [...prev, event.data]);
// //         }
// //       };

// //       recorder.onstop = () => {
// //         processRecording();
// //       };

// //       setMediaRecorder(recorder);
// //     } catch (error) {
// //       console.error("Error setting up media recorder:", error);
// //       alert(
// //         "Microphone access is required for voice mode. Please allow microphone access and refresh the page."
// //       );
// //     }
// //   };

// //   const initializeVoiceChat = async () => {
// //     const greeting =
// //       "Hello! I'm here to help assess your chest pain. Let's start with some questions. What is your age?";

// //     const newConversation = [
// //       {
// //         role: Role.Assistant,
// //         content: greeting,
// //         timestamp: new Date().toISOString(),
// //       },
// //     ];
// //     setConversation(newConversation);
// //     // setConversation((prev: ConversationMessage[]) => [
// //     //   ...prev,
// //     //   ...newConversation,
// //     // ]);
// //     await speakText(greeting);
// //   };

// //   const startRecording = () => {
// //     if (mediaRecorder && mediaRecorder.state === "inactive") {
// //       setAudioChunks([]);
// //       setIsRecording(true);
// //       mediaRecorder.start();
// //     }
// //   };

// //   const stopRecording = () => {
// //     if (mediaRecorder && mediaRecorder.state === "recording") {
// //       setIsRecording(false);
// //       mediaRecorder.stop();
// //     }
// //   };

// //   const processRecording = async () => {
// //     if (audioChunks.length === 0) return;

// //     setIsProcessing(true);

// //     try {
// //       // Create audio blob
// //       const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

// //       // Transcribe audio
// //       const formData = new FormData();
// //       formData.append("audio", audioBlob, "recording.wav");

// //       const transcribeResponse = await fetch(
// //         `${API_BASE_URL}/voice/transcribe`,
// //         {
// //           method: "POST",
// //           body: formData,
// //         }
// //       );

// //       const transcriptionData = await transcribeResponse.json();
// //       const userMessage = transcriptionData.transcription;

// //       // Add user message to conversation
// //       const updatedConversation = [
// //         ...conversation,
// //         {
// //           role: Role.User,
// //           content: userMessage,
// //           timestamp: new Date().toISOString(),
// //         },
// //       ];

// //       setConversation(updatedConversation);

// //       // Get AI response
// //       const chatResponse = await fetch(`${API_BASE_URL}/voice/chat`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           session_id: sessionId,
// //           responses: updatedConversation.map((msg) => ({
// //             role: msg.role,
// //             content: msg.content,
// //           })),
// //         }),
// //       });

// //       const chatData = await chatResponse.json();
// //       const aiResponse = chatData.response;

// //       // Add AI response to conversation
// //       const finalConversation = [
// //         ...updatedConversation,
// //         {
// //           role: Role.Assistant,
// //           content: aiResponse,
// //           timestamp: new Date().toISOString(),
// //         },
// //       ];

// //       setConversation(finalConversation);

// //       // Check if assessment is complete (13 questions answered)
// //       const userResponses = finalConversation.filter(
// //         (msg) => msg.role === Role.User
// //       );
// //       if (userResponses.length >= 13) {
// //         await completeAssessment(finalConversation);
// //       } else {
// //         // Speak the AI response
// //         await speakText(aiResponse);
// //       }
// //     } catch (error) {
// //       console.error("Error processing recording:", error);
// //       alert("Error processing your voice. Please try again.");
// //     } finally {
// //       setIsProcessing(false);
// //       setAudioChunks([]);
// //     }
// //   };

// //   const speakText = async (text: string) => {
// //     try {
// //       setIsPlaying(true);

// //       // Use Web Speech API for text-to-speech (fallback)
// //       if ("speechSynthesis" in window) {
// //         const utterance = new SpeechSynthesisUtterance(text);
// //         utterance.rate = 0.9;
// //         utterance.pitch = 1;
// //         utterance.volume = 1;

// //         utterance.onend = () => {
// //           setIsPlaying(false);
// //         };

// //         utterance.onerror = () => {
// //           setIsPlaying(false);
// //         };

// //         speechSynthesis.speak(utterance);
// //       } else {
// //         // Fallback: just set playing to false after a delay
// //         setTimeout(() => setIsPlaying(false), 3000);
// //       }
// //     } catch (error) {
// //       console.error("Error with text-to-speech:", error);
// //       setIsPlaying(false);
// //     }
// //   };

// //   const completeAssessment = async (
// //     conversationHistory: ConversationMessage[]
// //   ) => {
// //     setAssessmentComplete(true);

// //     try {
// //       // Extract responses from conversation
// //       const questions = [
// //         "What is your age?",
// //         "Are you male or female?",
// //         "How would you describe your chest pain?",
// //         "On a scale of 1-10, how severe is your chest pain?",
// //         "When did the chest pain start?",
// //         "Does the pain radiate to your arm, jaw, neck, or back?",
// //         "Are you experiencing shortness of breath?",
// //         "Are you feeling nauseous or have you vomited?",
// //         "Are you sweating more than usual?",
// //         "Do you have a history of heart disease?",
// //         "Do you have diabetes?",
// //         "Do you smoke or have you smoked in the past?",
// //         "Do you have high blood pressure?",
// //       ];

// //       const userResponses = conversationHistory.filter(
// //         (msg: ConversationMessage) => msg.role === "user"
// //       );
// //       const assessmentResponses = userResponses
// //         .slice(0, 13)
// //         .map((response: ConversationMessage, index: number) => ({
// //           question_id: index + 1,
// //           question: questions[index] || `Question ${index + 1}`,
// //           answer: response.content,
// //           session_id: sessionId,
// //         }));

// //       // Submit assessment
// //       const response = await fetch(`${API_BASE_URL}/assess`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           responses: assessmentResponses,
// //           session_id: sessionId,
// //         }),
// //       });

// //       const result = await response.json();

// //       // Speak the final result
// //       await speakText(`Assessment complete. ${result.message}`);

// //       // Complete the assessment
// //       onComplete(result);
// //     } catch (error) {
// //       console.error("Error completing assessment:", error);
// //       alert("Error completing assessment. Please try again.");
// //     }
// //   };

// //   const toggleRecording = () => {
// //     if (isRecording) {
// //       stopRecording();
// //     } else {
// //       startRecording();
// //     }
// //   };

// //   return (
// //     <div className="max-w-4xl mx-auto">
// //       <div className="text-center mb-6">
// //         <h2 className="text-2xl font-semibold text-gray-800 mb-2">
// //           Voice Assessment
// //         </h2>
// //         <p className="text-gray-600">
// //           Click the microphone button to speak. Your conversation will be
// //           transcribed below.
// //         </p>
// //       </div>

// //       {/* Chat Container */}
// //       <div
// //         ref={chatContainerRef}
// //         className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-6 border"
// //       >
// //         {conversation.length === 0 ? (
// //           <div className="text-center text-gray-500 mt-8">
// //             <p>Conversation will appear here...</p>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //             {conversation.map((message, index) => (
// //               <div
// //                 key={index}
// //                 className={`flex ${
// //                   message.role === "user" ? "justify-end" : "justify-start"
// //                 }`}
// //               >
// //                 <div
// //                   className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
// //                     message.role === "user"
// //                       ? "bg-blue-600 text-white"
// //                       : "bg-white text-gray-800 shadow-sm border"
// //                   }`}
// //                 >
// //                   <div className="flex items-start space-x-2">
// //                     <div className="text-sm">
// //                       {message.role === "user" ? "👤" : "🤖"}
// //                     </div>
// //                     <div className="flex-1">
// //                       <p className="text-sm">{message.content}</p>
// //                       <p
// //                         className={`text-xs mt-1 ${
// //                           message.role === "user"
// //                             ? "text-blue-200"
// //                             : "text-gray-500"
// //                         }`}
// //                       >
// //                         {new Date(message.timestamp).toLocaleTimeString()}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {/* Voice Controls */}
// //       <div className="flex justify-center items-center space-x-4">
// //         <button
// //           onClick={toggleRecording}
// //           disabled={isProcessing || isPlaying || assessmentComplete}
// //           className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-all duration-200 ${
// //             isRecording
// //               ? "bg-red-600 hover:bg-red-700 animate-pulse"
// //               : isProcessing || isPlaying
// //               ? "bg-gray-400 cursor-not-allowed"
// //               : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
// //           }`}
// //         >
// //           {isRecording ? "⏹️" : "🎤"}
// //         </button>

// //         <div className="text-center">
// //           {isRecording && (
// //             <p className="text-sm text-red-600 font-medium animate-pulse">
// //               Recording... Click to stop
// //             </p>
// //           )}
// //           {isProcessing && (
// //             <p className="text-sm text-blue-600 font-medium">
// //               Processing your voice...
// //             </p>
// //           )}
// //           {isPlaying && (
// //             <p className="text-sm text-green-600 font-medium">
// //               AI is speaking...
// //             </p>
// //           )}
// //           {!isRecording &&
// //             !isProcessing &&
// //             !isPlaying &&
// //             !assessmentComplete && (
// //               <p className="text-sm text-gray-600">Click microphone to speak</p>
// //             )}
// //           {assessmentComplete && (
// //             <p className="text-sm text-green-600 font-medium">
// //               Assessment complete!
// //             </p>
// //           )}
// //         </div>
// //       </div>

// //       {/* Instructions */}
// //       <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
// //         <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
// //         <ul className="text-sm text-blue-700 space-y-1">
// //           <li>• Click the microphone button and speak your answer</li>
// //           <li>• Your speech will be transcribed and shown in the chat</li>
// //           <li>• The AI will ask follow-up questions and speak them aloud</li>
// //           <li>
// //             • The assessment will complete after all questions are answered
// //           </li>
// //         </ul>
// //       </div>

// //       {/* Progress indicator */}
// //       {conversation.length > 0 && !assessmentComplete && (
// //         <div className="mt-4 text-center">
// //           <p className="text-sm text-gray-600">
// //             Questions answered:{" "}
// //             {Math.floor(
// //               conversation.filter((msg) => msg.role === "user").length
// //             )}{" "}
// //             / 13
// //           </p>
// //           <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
// //             <div
// //               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// //               style={{
// //                 width: `${Math.min(
// //                   (conversation.filter(
// //                     (msg: ConversationMessage) => msg.role === "user"
// //                   ).length /
// //                     13) *
// //                     100,
// //                   100
// //                 )}%`,
// //               }}
// //             ></div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

const Message = ({ type, text }: MessageProps) => {
  return (
    <div className="message">
      <strong className={`message-${type}`}>
        {type === "agent" ? "Agent: " : "You: "}
      </strong>
      <span className="message-text">{text}</span>
    </div>
  );
};

const VoiceMode = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [messages, setMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    const allMessages = [
      ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),
      ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),
    ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
    setMessages(allMessages);
  }, [agentTranscriptions, userTranscriptions]);

  return (
    <div className="voice-assistant-container">
      <div className="visualizer-container">
        <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
      </div>
      <div className="control-section">
        <VoiceAssistantControlBar />
        <div className="conversation">
          {messages.map((msg, index) => (
            <Message key={msg.id || index} type={msg.type} text={msg.text} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceMode;
