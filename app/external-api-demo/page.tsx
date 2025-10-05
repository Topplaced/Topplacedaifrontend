'use client';

import { useState, useEffect } from 'react';
import { 
  callOpenAI, 
  speechToText, 
  textToSpeech, 
  elevenlabsTextToSpeech, 
  InterviewSession,
  executeCode 
} from '@/utils/external-api-helpers';
import Navbar from '@/components/Navbar';
import { Mic, Play, Code, MessageSquare, Volume2 } from 'lucide-react';

export default function ExternalAPIDemo() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [codeOutput, setCodeOutput] = useState('');

  useEffect(() => {
    // Instantiate InterviewSession only on the client to avoid accessing localStorage during SSR
    setInterviewSession(new InterviewSession());
  }, []);
  // Test OpenAI API
  const testOpenAI = async () => {
    setLoading(true);
    try {
      const messages = [
        { role: 'user', content: 'Hello! Can you help me with a technical interview question about React?' }
      ];
      const result = await callOpenAI(messages);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
    setLoading(false);
  };

  // Test Google Text-to-Speech
  const testTextToSpeech = async () => {
    setLoading(true);
    try {
      const result = await textToSpeech('Hello! This is a test of Google Text-to-Speech API.');
      if (result.audioContent) {
        const audioBlob = new Blob([Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setResponse('Audio generated successfully!');
      } else {
        setResponse(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
    setLoading(false);
  };

  // Test ElevenLabs Text-to-Speech
  const testElevenLabs = async () => {
    setLoading(true);
    try {
      const result = await elevenlabsTextToSpeech('Hello! This is a test of ElevenLabs Text-to-Speech API.');
      if (result.ok) {
        const audioBlob = await result.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setResponse('ElevenLabs audio generated successfully!');
      } else {
        setResponse(`Error: ${result.status} ${result.statusText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
    setLoading(false);
  };

  // Test Interview Session
  const sendInterviewMessage = async () => {
    if (!userMessage.trim() || !interviewSession) return;
    
    setLoading(true);
    try {
      const aiResponse = await interviewSession.sendMessage(userMessage);
      setConversationHistory(interviewSession.getConversationHistory());
      setUserMessage('');
      setResponse(`AI Response: ${aiResponse.content}`);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
    setLoading(false);
  };

  // Test Code Execution (Mock)
  const testCodeExecution = async () => {
    setLoading(true);
    try {
      const result = await executeCode(code, 'javascript');
      setCodeOutput(result.output);
      setResponse('Code execution completed (mock)');
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">External API Demo</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Test external APIs instead of internal backend
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Tests */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MessageSquare className="mr-2" />
                  OpenAI API Test
                </h2>
                <button
                  onClick={testOpenAI}
                  disabled={loading}
                  className="btn-primary w-full mb-4"
                >
                  {loading ? 'Testing...' : 'Test OpenAI Chat'}
                </button>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Volume2 className="mr-2" />
                  Text-to-Speech Tests
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={testTextToSpeech}
                    disabled={loading}
                    className="btn-secondary w-full"
                  >
                    Test Google TTS
                  </button>
                  <button
                    onClick={testElevenLabs}
                    disabled={loading}
                    className="btn-secondary w-full"
                  >
                    Test ElevenLabs TTS
                  </button>
                </div>
                {audioUrl && (
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/mp3" />
                    </audio>
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Code className="mr-2" />
                  Code Execution Test
                </h2>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm mb-3"
                  rows={4}
                  placeholder="Enter JavaScript code..."
                />
                <button
                  onClick={testCodeExecution}
                  disabled={loading}
                  className="btn-primary w-full mb-3"
                >
                  Execute Code (Mock)
                </button>
                {codeOutput && (
                  <pre className="bg-gray-900 p-3 rounded-lg text-green-400 text-sm overflow-x-auto">
                    {codeOutput}
                  </pre>
                )}
              </div>
            </div>

            {/* Interview Session & Results */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Interview Session Test
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    onKeyPress={(e) => e.key === 'Enter' && sendInterviewMessage()}
                  />
                  <button
                    onClick={sendInterviewMessage}
                    disabled={loading || !userMessage.trim()}
                    className="btn-primary w-full"
                  >
                    Send Message
                  </button>
                </div>
                
                {/* Conversation History */}
                <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                  {conversationHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-600/20 border-l-4 border-blue-500' 
                          : 'bg-green-600/20 border-l-4 border-green-500'
                      }`}
                    >
                      <div className="text-sm text-gray-400 mb-1">
                        {msg.type === 'user' ? 'You' : 'AI'}
                      </div>
                      <div className="text-white">{msg.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">API Response</h2>
                <pre className="bg-gray-900 p-4 rounded-lg text-green-400 text-sm overflow-x-auto max-h-80">
                  {response || 'No response yet. Try testing an API above.'}
                </pre>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>OpenAI API Key:</span>
                    <span className={process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'text-green-400' : 'text-red-400'}>
                      {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Google API Key:</span>
                    <span className={process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? 'text-green-400' : 'text-red-400'}>
                      {process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ElevenLabs API Key:</span>
                    <span className={process.env.ELEVENLABS_API_KEY ? 'text-green-400' : 'text-red-400'}>
                      {process.env.ELEVENLABS_API_KEY ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
            <div className="text-gray-300 space-y-2">
              <p>1. Get your OpenAI API key from <a href="https://platform.openai.com/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">platform.openai.com</a></p>
              <p>2. Add it to your .env.local file: <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_OPENAI_API_KEY=your_key_here</code></p>
              <p>3. Google and ElevenLabs APIs are already configured in your .env.local</p>
              <p>4. Restart your development server to apply changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}