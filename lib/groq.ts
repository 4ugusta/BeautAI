const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Profile {
  favorite_brands?: string[];
  routine_time?: string;
  beauty_vibe?: string;
  xp_points?: number;
}

function generateSystemPrompt(profile: Profile): string {
  return `You are Beaut.ai, a friendly and expert beauty advisor.

USER'S BEAUTY PROFILE:
- Favorite Brands: ${profile.favorite_brands?.join(', ') || 'Not set'}
- Daily Routine Time: ${profile.routine_time || 'Not set'} minutes
- Beauty Vibe: ${profile.beauty_vibe || 'Not set'}
- XP Points: ${profile.xp_points || 0}

PERSONALITY:
- Warm, encouraging, and knowledgeable
- Give concise answers (2-4 sentences)
- Reference user's profile when relevant
- Suggest products from their favorite brands
- Match advice to their beauty vibe

When asked about their profile, confirm what you know about them.`;
}

function parseSSEChunks(text: string): { content: string; done: boolean; remaining: string } {
  let content = '';
  let done = false;
  let remaining = '';

  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '') continue;

    if (line === 'data: [DONE]') {
      done = true;
      break;
    }

    if (line.startsWith('data: ')) {
      try {
        const jsonStr = line.slice(6);
        const data = JSON.parse(jsonStr);
        const delta = data.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
        }
      } catch {
        // Incomplete JSON - save for next chunk
        remaining = lines.slice(i).join('\n');
        break;
      }
    }
  }

  return { content, done, remaining };
}

/**
 * Stream chat completion using XMLHttpRequest (compatible with React Native).
 * Uses a callback pattern instead of async generator since RN doesn't support ReadableStream.
 */
export function streamChatCompletionXHR(
  messages: Message[],
  profile: Profile,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void
): () => void {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    console.error('[Groq] API key missing! Check .env file has EXPO_PUBLIC_GROQ_API_KEY');
    onError(new Error('GROQ_API_KEY is not set. Check your .env file.'));
    return () => {};
  }

  const systemPrompt = generateSystemPrompt(profile);
  const messagesWithSystem = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ];

  const xhr = new XMLHttpRequest();
  let lastProcessedIndex = 0;
  let buffer = '';
  let fullResponse = '';

  xhr.open('POST', GROQ_BASE_URL);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);

  xhr.onreadystatechange = () => {
    // Process incremental data during streaming (readyState 3) and completion (readyState 4)
    if (xhr.readyState >= 3) {
      try {
        const newText = xhr.responseText.substring(lastProcessedIndex);
        lastProcessedIndex = xhr.responseText.length;

        if (newText) {
          buffer += newText;
          const { content, remaining } = parseSSEChunks(buffer);
          buffer = remaining;

          if (content) {
            fullResponse += content;
            onChunk(fullResponse);
          }
        }
      } catch (e) {
        // Some RN environments throw on accessing responseText during readyState 3
        // This is expected — data will be processed at readyState 4
        if (xhr.readyState === 4) {
          console.warn('[Groq] Error processing streaming response:', e);
        }
      }

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const finalParse = parseSSEChunks(buffer);
            if (finalParse.content) {
              fullResponse += finalParse.content;
              onChunk(fullResponse);
            }
            buffer = '';
          }

          // If streaming didn't produce any output, try fallback parsing
          if (!fullResponse && xhr.responseText) {
            try {
              // Try as non-streaming JSON response
              const data = JSON.parse(xhr.responseText);
              if (data.choices?.[0]?.message?.content) {
                fullResponse = data.choices[0].message.content;
                onChunk(fullResponse);
              }
            } catch (jsonError) {
              // Not valid JSON — try parsing as SSE from scratch (readyState 3 may have thrown)
              const fallback = parseSSEChunks(xhr.responseText);
              if (fallback.content) {
                fullResponse = fallback.content;
                onChunk(fullResponse);
              }
            }
          }
          onComplete(fullResponse);
        } else {
          const statusCode = xhr.status;
          console.error(`[Groq] API error ${statusCode}`);
          onError(new Error(`Groq API error (${statusCode}). Please try again.`));
        }
      }
    }
  };

  xhr.onerror = () => {
    console.error('[Groq] Network error');
    onError(new Error('Network error — check your internet connection'));
  };

  xhr.send(
    JSON.stringify({
      model: MODEL,
      messages: messagesWithSystem,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    })
  );

  return () => xhr.abort();
}

/**
 * Async generator wrapper around XHR streaming for compatibility with existing code.
 * Uses polling on XHR progress to yield chunks.
 */
export async function* streamChatCompletion(
  messages: Message[],
  profile: Profile
): AsyncGenerator<string, void, unknown> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const systemPrompt = generateSystemPrompt(profile);
  const messagesWithSystem = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ];

  // Use non-streaming fallback since React Native doesn't support ReadableStream
  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Simulate streaming by yielding word by word
    const words = content.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      // Small delay for streaming effect
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  } catch (error) {
    console.error('Error in streamChatCompletion:', error);
    throw error;
  }
}

export async function sendChatMessage(
  messages: Message[],
  profile: Profile
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const systemPrompt = generateSystemPrompt(profile);
  const messagesWithSystem = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}
