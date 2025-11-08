"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Bot, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ConversationResponse {
  success: boolean;
  sessionId: string;
  messageId: string;
  aiResponse: string;
  shortResponse?: string;
  currentQuestion?: {
    id: string;
    question: string;
    questionNumber: number;
    totalQuestions: number;
  expectedTime?: number;
    requiresCode: boolean;
    category: string;
  };
  progress?: {
    questionsAnswered: number;
    totalQuestions: number;
    completionPercentage: number;
  };
  timestamp: string;
}

export default function InterviewDemo() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");

  const startNewSession = async () => {
    try {
      setIsLoading(true);

      // Start a new interview session
      const response = await fetch(`${API_URL}/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: "Demo User",
            email: "demo@example.com",
            role: "Frontend Developer",
            experience: 3,
            skills: ["JavaScript", "React", "TypeScript"],
            goals: "Prepare for technical interviews",
          },
          configuration: {
            level: "intermediate",
            category: "frontend",
            duration: 30,
            language: "javascript",
            hasCodeEditor: false,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setCurrentQuestion(data.firstQuestion.question);

        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: `${data.message}\n\nFirst Question: ${data.firstQuestion.question}`,
          timestamp: new Date(),
        };

        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!userInput.trim() || !sessionId) return;

    try {
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: userInput,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setUserInput("");

      // Send to enhanced conversation endpoint
      const response = await fetch(
        `${API_URL}/interview/conversation/enhanced`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            message: userInput,
            questionId: currentQuestion ? `q_${Date.now()}` : undefined,
            responseTime: Math.floor(Math.random() * 60) + 30, // Random response time
            metadata: {
              messageType: "answer",
            },
          }),
        }
      );

      const data: ConversationResponse = await response.json();

      if (data.success) {
        // Add AI response
        const aiMessage: Message = {
          id: data.messageId,
          type: "ai",
          content: data.shortResponse ?? data.aiResponse,
          timestamp: new Date(data.timestamp),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // If there's a new question, add it
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion.question);

          const questionMessage: Message = {
            id: `q_${Date.now()}`,
            type: "ai",
            content: `Next Question (${data.currentQuestion.questionNumber}/${data.currentQuestion.totalQuestions}): ${data.currentQuestion.question}`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, questionMessage]);
        }
      }
    } catch (error) {
      console.error("Error sending answer:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "ai",
        content:
          "Sorry, I encountered an error processing your response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Interview Answer-to-ChatGPT Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This demo shows how interview answers are sent to ChatGPT to
              generate follow-up questions related to your responses.
            </p>

            {!sessionId ? (
              <Button
                onClick={startNewSession}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Starting Session..." : "Start Interview Session"}
              </Button>
            ) : (
              <div className="text-sm text-green-600">
                Session ID: {sessionId}
              </div>
            )}
          </CardContent>
        </Card>

        {sessionId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.type === "ai" && (
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here... (Press Enter to send)"
                  className="flex-1"
                  rows={3}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendAnswer}
                  disabled={isLoading || !userInput.trim()}
                  size="sm"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {isLoading && (
                <div className="text-center text-gray-500 mt-2">
                  AI is processing your response...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <strong>Start Session:</strong> Creates a new interview
                  session with your profile and preferences
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <strong>Send Answer:</strong> Your response is sent to the{" "}
                  <code>/interview/conversation/enhanced</code> endpoint
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <strong>AI Processing:</strong> ChatGPT analyzes your answer
                  and generates contextual follow-up questions
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-orange-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                </div>
                <div>
                  <strong>Response:</strong> You receive AI feedback and the
                  next question tailored to your previous answers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
