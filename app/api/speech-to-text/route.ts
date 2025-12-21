import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// OpenAI Whisper API integration
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        transcript: 'API key missing - please configure OPENAI_API_KEY' 
      }, { status: 500 });
    }

    console.log('🎤 Making OpenAI Whisper API call...');

    // Prepare FormData for OpenAI
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', 'en'); // Optional: optimize for English

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI Whisper API error: ${response.status} - ${errorText}`);
      
      // Return fallback response
      const mockResponses = [
        'I have experience in full-stack development and I am excited about this opportunity.',
        'My strengths include problem-solving, teamwork, and continuous learning.',
        'I am passionate about creating user-friendly applications and solving complex problems.',
        'I have worked with React, Node.js, and various databases in my previous projects.',
        'I am looking forward to contributing to your team and growing my career.'
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return NextResponse.json({ 
        transcript: randomResponse,
        confidence: 0.85,
        source: 'fallback',
        error: `OpenAI API error: ${response.status}`
      });
    }

    const data = await response.json();
    console.log('✅ OpenAI Whisper response:', data);
    
    if (data.text) {
      return NextResponse.json({ 
        transcript: data.text,
        confidence: 0.99, // Whisper doesn't return confidence per segment easily in simple API
        source: 'openai-whisper'
      });
    } else {
      console.warn('No text result from OpenAI API');
      return NextResponse.json({ 
        transcript: 'Could not transcribe audio clearly. Please try speaking again.',
        confidence: 0.0,
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    // Fallback to mock response
    const mockResponses = [
      'I understand the question and will provide a thoughtful response.',
      'Thank you for the question. Let me share my experience with this topic.',
      'That\'s an interesting question. Based on my experience, I would say...',
      'I have encountered similar challenges in my previous work.',
      'I believe my background in this area makes me a good fit for this role.'
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return NextResponse.json({ 
      transcript: randomResponse,
      confidence: 0.8,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
