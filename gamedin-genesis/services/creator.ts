import { GoogleGenAI } from '@google/genai';
import { User } from '../types';

interface ConceptInputs {
    name: string;
    category: string;
    faction: string;
    description: string;
}

export async function generateConcept(inputs: ConceptInputs, user: User): Promise<{ imageUrl: string, description: string }> {
    if (!process.env.API_KEY) {
        throw new Error("The Creator's Forge is cold. API_KEY is missing.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // --- Image Generation Prompt ---
    const imagePrompt = `Epic fantasy digital painting of a video game character concept named "${inputs.name}".
    Category: ${inputs.category}.
    Faction: ${inputs.faction}.
    Key Features: ${inputs.description}.
    Style: Detailed, high-resolution, dramatic lighting, concept art, fantasy, intricate details.`;

    // --- Text Generation Prompt ---
    const textPrompt = `Create a detailed character concept for a video game, based on the following details.
    Your response should be a compelling, well-written description suitable for a game's lore book or character selection screen.
    
    Character Name: "${inputs.name}"
    Character Category/Class: "${inputs.category}"
    Character Faction/Allegiance: "${inputs.faction}"
    Core Concept: "${inputs.description}"
    
    Flesh out the following aspects:
    1.  **Appearance:** Describe their visual details, clothing, and any notable features.
    2.  **Backstory:** Provide a brief but engaging history. What are their origins? What key events shaped them?
    3.  **Personality & Motivation:** What drives them? What is their general demeanor? Connect it to their "${user.path}" path and their dream to "${user.dream}".
    
    Keep the tone consistent with a high-fantasy, epic setting.`;

    try {
        console.log('[Creator Service] Generating image and text...');
        const [imageResponse, textResponse] = await Promise.all([
            ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '3:4',
                },
            }),
            ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: textPrompt,
            })
        ]);

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        const description = textResponse.text;

        console.log('[Creator Service] Generation complete.');
        return { imageUrl, description };

    } catch (err) {
        console.error('[Creator AI Error]', err);
        if (err instanceof Error) {
            throw new Error(`The forge's fire has dimmed. There was a problem creating your concept. Details: ${err.message}`);
        }
        throw new Error('An unknown interference disrupted the creation process.');
    }
}
