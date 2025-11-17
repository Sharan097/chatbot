// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const maxDuration = 30;

// Support both environment variable names for Gemini
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Validate API keys on module load
if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {
  console.warn('WARNING: No AI API keys configured in .env.local');
  console.warn('Please add GOOGLE_API_KEY or OPENROUTER_API_KEY');
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user) {
      console.error('Unauthorized chat request - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, model, webSearch } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content || '';

    if (!userContent.trim()) {
      return NextResponse.json(
        { error: 'Empty message content' },
        { status: 400 }
      );
    }

    console.log('Chat request:', {
      user: session.user.email,
      model,
      messageLength: userContent.length,
      webSearch,
    });

    let response: string;
    let usedModel = model;

    try {
      // Route to correct AI model
      if (model === 'deepseek/deepseek-v3-free' || model.startsWith('deepseek/')) {
        console.log('Attempting DeepSeek API...');
        response = await callDeepSeek(userContent);
        console.log('DeepSeek response received');
      } else {
        console.log('Using Gemini API...');
        response = await callGemini(userContent);
        console.log('Gemini response received');
      }
    } catch (modelError) {
      const error = modelError as Error;
      console.error(`${usedModel} failed:`, error.message);
      console.log('Falling back to alternative model...');
      
      // Fallback logic
      try {
        if (model.startsWith('deepseek/') && GEMINI_API_KEY) {
          // DeepSeek failed, try Gemini
          response = await callGemini(userContent);
          usedModel = 'gemini-2.0-flash-exp';
          console.log('Gemini fallback successful');
        } else if (OPENROUTER_API_KEY) {
          // Gemini failed, try DeepSeek
          response = await callDeepSeek(userContent);
          usedModel = 'deepseek/deepseek-chat';
          console.log('DeepSeek fallback successful');
        } else {
          throw new Error('No fallback model available');
        }
      } catch (fallbackError) {
        const fbError = fallbackError as Error;
        console.error('Fallback also failed:', fbError.message);
        throw new Error('Both AI models are unavailable. Please try again later.');
      }
    }

    console.log('Chat response sent:', { model: usedModel, responseLength: response.length });

    return NextResponse.json({
      role: 'assistant',
      content: response,
      model: usedModel,
    });

  } catch (error) {
    const err = error as Error;
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// Call Google Gemini API
async function callGemini(prompt: string): Promise<string> {
  const apiKey = GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add GOOGLE_API_KEY to .env.local');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      // Parse error details if available
      try {
        const errorData = JSON.parse(errorText) as { error?: { message?: string } };
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Gemini API error: ${errorMessage}`);
      } catch {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    
    // Validate response structure
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('Invalid Gemini API response format');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    const err = error as Error;
    console.error('Gemini API call failed:', err.message);
    throw error;
  }
}

// Call DeepSeek through OpenRouter
async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local');
  }

  try {
    const requestBody = {
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3001',
        'X-Title': 'AI Chatbot',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', errorText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText) as { error?: { message?: string } };
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`DeepSeek API error: ${errorMessage}`);
      } catch {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    
    // Validate response structure
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid DeepSeek response:', JSON.stringify(data, null, 2));
      throw new Error('Invalid DeepSeek API response format');
    }

    return data.choices[0].message.content;
  } catch (error) {
    const err = error as Error;
    console.error('DeepSeek API call failed:', err.message);
    throw error;
  }
}
