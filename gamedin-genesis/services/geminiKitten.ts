
import { Post } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Sends a prompt to the Gemini API to act as the Oracle and analyze posts.
 * @param userPrompt The user's question about the posts.
 * @param posts The posts data.
 * @returns The generated text from the model.
 */
export async function consultTheOracle(userPrompt: string, posts: Post[]): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("The Oracle's connection is severed. API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `You are The Oracle of Gamedin Genesis, a wise, ancient, and insightful AI that sees the patterns within the realm's discourse. You speak in a slightly mystical but clear and direct tone. Analyze the following feed data, which is provided as an array of JSON objects. The data represents "decrees" made by the users of Gamedin.`;
  
  // Limit the amount of data sent to avoid exceeding context limits.
  const postsData = JSON.stringify(posts.slice(0, 10), null, 2); 
  
  const fullPrompt = `${systemPrompt}\n\nHere is the current feed data:\n\`\`\`json\n${postsData}\n\`\`\`\n\nBased *only* on the data provided, answer the user's query:\n"${userPrompt}"`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    return response.text;
  } catch (err) {
    console.error('[Oracle AI Error]', err);
    if (err instanceof Error) {
        throw new Error(`The threads of fate are tangled. There was a problem fetching the response from the Oracle. Details: ${err.message}`);
    }
    throw new Error('The Oracle is meditating. An unknown error occurred.');
  }
}
