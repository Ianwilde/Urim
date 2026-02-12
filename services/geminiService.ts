
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const processHandwrittenText = async (
  base64Image: string,
  translateToSpanish: boolean
) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the handwritten text in this image. 
    1. Extract the text accurately.
    2. Correct any grammatical, spelling, or punctuation errors.
    3. ${translateToSpanish ? 'Translate the corrected text into natural, fluent Spanish.' : 'Do not translate.'}
    
    Return the result in a strict JSON format with keys: "originalText", "correctedText", and "spanishText" (null if not requested).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalText: { type: Type.STRING },
          correctedText: { type: Type.STRING },
          spanishText: { type: Type.STRING, nullable: true }
        },
        required: ["originalText", "correctedText"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid response format from AI");
  }
};

export const autoTranslateText = async (base64Image: string) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Look at the text in the center of the image. 
    If it is Spanish or Portuguese, translate it to English.
    Provide a brief clarification if the context is helpful.
    If no clear text is found, return confidence 0.
    
    Return JSON with: "detectedLanguage", "englishTranslation", "clarification", "confidence" (0-1).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedLanguage: { type: Type.STRING },
          englishTranslation: { type: Type.STRING },
          clarification: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["detectedLanguage", "englishTranslation", "confidence"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};
