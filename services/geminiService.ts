import { GoogleGenAI } from "@google/genai";
import { blobToBase64 } from "../utils/audioHelpers";

/**
 * Transcribes audio using Gemini 2.5 Flash.
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Audio = await blobToBase64(audioBlob);

    // Determine mime type (default to audio/webm if not present on blob)
    // Most browsers record to audio/webm or audio/mp4
    const mimeType = audioBlob.type || 'audio/mp4'; 

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: `
            Please transcribe the provided audio file. 
            Follow these rules strictly:
            1. Transcribe the speech exactly as spoken (verbatim).
            2. Do not add any introductory or concluding remarks (e.g., "Here is the transcription").
            3. Correct obvious mispronunciations only if the context is clear, otherwise keep it phonetic or label [unintelligible].
            4. If there are multiple speakers, identify them as Speaker 1, Speaker 2, etc., if distinguishable.
            5. Format the output with clear paragraph breaks for readability.
            `
          }
        ]
      },
      config: {
        temperature: 0.2, // Lower temperature for more accurate transcription
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No transcription generated.");
    }
    
    return text;

  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};
