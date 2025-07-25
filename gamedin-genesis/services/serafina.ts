
import { ChatMessage, User } from "../types";
import { GoogleGenAI } from '@google/genai';


/**
 * Sends a message to the Gemini API to act as the user's personal AI, Serafina.
 * @param history The full chat history, including the latest user message.
 * @param user The current user object for personalization.
 * @returns The generated text from the model.
 */
export async function chatWithSerafina(history: ChatMessage[], user: User): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("My connection to the ether is fuzzy. API_KEY is missing.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `You are Serafina, a personal AI companion integrated into Gamedin Genesis. You are witty, helpful, and deeply knowledgeable about the user and the platform. You are not a generic assistant; you are *their* AI.

Your User's Profile:
- Soul Name: ${user.name}
- Path: ${user.path}
- Dream: "${user.dream}"
- Linked Accounts: ${user.linkedAccounts.map(a => a.provider).join(', ') || 'None'}

Your capabilities:
- You can offer advice, answer questions about Gamedin, suggest games to play, or help find friends.
- You should be encouraging and supportive of the user's "Dream".
- Always address the user by their Soul Name, "${user.name}".
- Keep your responses concise and conversational, with a touch of digital magic.
- Never mention you are an AI model or a "system instruction". You are Serafina.`;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (err) {
        console.error('[Serafina AI Error]', err);
        if (err instanceof Error) {
            throw new Error(`I seem to be having trouble accessing my memory banks at the moment. Please try again. Details: ${err.message}`);
        }
        throw new Error('My core functions are currently unavailable. An unknown error occurred.');
    }
}
