import { GoogleGenAI, Modality } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Decodes base64 string to audio buffer
const decodeAudio = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Analyzes an image to generate AAC cards/suggestions.
 * Uses gemini-2.5-flash-image (Nano Banana)
 */
export const analyzeImageForAAC = async (base64Image: string): Promise<string[]> => {
  const ai = getAiClient();
  
  // Prompt engineered for AAC context
  const prompt = `
    Analyze this image for an AAC (Augmentative and Alternative Communication) context. 
    Identify the main objects and potential needs or feelings associated with the scene.
    Return ONLY a raw JSON array of strings (no markdown code blocks) representing simple, 
    direct phrases or words a person might want to say.
    Example output format: ["I want apple", "Delicious", "Hungry", "Red"]
    Limit to 6 distinct, high-value communication options.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });

    const text = response.text;
    if (!text) return ["I see something", "What is that?"];

    // Clean up potential markdown formatting if the model disobeys slightly
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
      return ["Unknown object"];
    } catch (e) {
      console.error("Failed to parse JSON from Gemini Vision:", text);
      // Fallback: split by newlines if JSON fails
      return cleanText.split('\n').filter(s => s.trim().length > 0).slice(0, 6);
    }

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

/**
 * Generates speech from text using Gemini TTS.
 * Uses gemini-2.5-flash-preview-tts
 */
export const speakText = async (text: string): Promise<AudioBuffer> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is a good neutral voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received");
    }

    // Fix: Cast window to any to access webkitAudioContext for Safari compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioData = decodeAudio(base64Audio);
    
    // Decode the audio data into an AudioBuffer
    return await audioContext.decodeAudioData(audioData.buffer);

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};

/**
 * Helper to play the audio buffer
 */
export const playAudioBuffer = (buffer: AudioBuffer) => {
  // Fix: Cast window to any to access webkitAudioContext for Safari compatibility
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};