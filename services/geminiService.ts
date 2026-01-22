import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODELS } from "../constants";

// Helper to get AI client. 
// For Veo, we re-instantiate to capture the selected key if needed, 
// but generally process.env.API_KEY is used for the "included" key.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  // 1. Chat & Text (Thinking Mode supported)
  chat: async (
    history: { role: string; parts: { text: string }[] }[],
    message: string,
    useReasoning: boolean = false,
    useSearch: boolean = false
  ) => {
    const ai = getAiClient();
    const modelId = useReasoning ? MODELS.TEXT_PRO : MODELS.TEXT_STD;
    
    const config: any = {};
    
    if (useReasoning) {
      // Gemini 3 Pro Thinking Budget
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    if (useSearch) {
       config.tools = [{ googleSearch: {} }];
    }

    const chat = ai.chats.create({
      model: modelId,
      history: history,
      config: config
    });

    const result = await chat.sendMessage({ message });
    
    // Extract grounding if available
    let groundingChunks: any[] = [];
    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      groundingChunks = result.candidates[0].groundingMetadata.groundingChunks;
    }

    return {
      text: result.text,
      grounding: groundingChunks
    };
  },

  // 2. Fast Categorization (Flash Lite)
  categorizeExpense: async (description: string, amount: number) => {
    const ai = getAiClient();
    const prompt = `Categorize this expense: "${description}" amount: ${amount}. Return ONLY the category name from this list: Operational, Fundraising, Program Service, Administrative, Marketing, Other.`;
    
    const response = await ai.models.generateContent({
      model: MODELS.TEXT_FAST,
      contents: prompt,
    });
    return response.text?.trim() || 'Other';
  },

  // 3. Image Generation (Nano Banana Pro)
  generateImage: async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
    const ai = getAiClient();
    // Using generateContent for Nano Banana Pro (Gemini 3 Pro Image)
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_GEN,
      contents: prompt,
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  },

  // 4. Image Editing (Nano Banana)
  editImage: async (imageBase64: string, prompt: string) => {
    const ai = getAiClient();
    // Strip prefix if present for API
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_EDIT,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  },

  // 5. Video Generation (Veo)
  generateVideo: async (prompt: string, aspectRatio: '16:9' | '9:16') => {
    // Veo requires user-selected key
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    }
    
    // Create new instance to ensure key is picked up
    const ai = getAiClient(); 
    
    let operation = await ai.models.generateVideos({
      model: MODELS.VIDEO_GEN_FAST,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");
    
    // Fetch actual bytes
    const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  // 6. Audio Transcription (Flash)
  transcribeAudio: async (audioBase64: string, mimeType: string) => {
    const ai = getAiClient();
    const base64Data = audioBase64.replace(/^data:.*?;base64,/, "");

    const response = await ai.models.generateContent({
      model: MODELS.AUDIO_TRANSCRIPTION,
      contents: {
        parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: "Transcribe this audio precisely." }
        ]
      }
    });
    return response.text;
  },

  // 7. Video Analysis/Understanding (Pro)
  analyzeVideo: async (videoFile: File, prompt: string): Promise<string> => {
      // Note: For large videos in a real app, we'd use File API upload.
      // Here we assume small clips converted to base64 for the frontend-only demo constraint,
      // as we cannot upload to File API in this environment easily without backend.
      // LIMITATION: This mimics the flow using inline data for short clips (< 20MB).
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1];
                const ai = getAiClient();
                const response = await ai.models.generateContent({
                    model: MODELS.TEXT_PRO,
                    contents: {
                        parts: [
                            { inlineData: { mimeType: videoFile.type, data: base64String } },
                            { text: prompt || "Analyze this video." }
                        ]
                    }
                });
                resolve(response.text || "No analysis generated.");
            } catch (e) {
                reject(e);
            }
        };
        reader.readAsDataURL(videoFile);
      });
  },

  // 8. Image Analysis (Pro)
  analyzeImage: async (file: File, prompt: string): Promise<string> => {
     return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
             try {
                const base64String = (reader.result as string).split(',')[1];
                const ai = getAiClient();
                const response = await ai.models.generateContent({
                    model: MODELS.TEXT_PRO,
                    contents: {
                        parts: [
                            { inlineData: { mimeType: file.type, data: base64String } },
                            { text: prompt || "Describe this image in detail." }
                        ]
                    }
                });
                resolve(response.text || "No analysis.");
             } catch (e) {
                 reject(e);
             }
        };
        reader.readAsDataURL(file);
     });
  },

  // 9. Maps Grounding (Flash 2.5)
  askMaps: async (query: string, lat: number, lng: number) => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODELS.MAPS,
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    });
    
    let links: any[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
         links = response.candidates[0].groundingMetadata.groundingChunks;
    }
    
    return {
        text: response.text,
        links
    };
  },

  // 10. TTS
  speak: async (text: string) => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
          model: MODELS.AUDIO_SPEECH,
          contents: { parts: [{ text }] },
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              }
          }
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
          return base64Audio;
      }
      throw new Error("No audio generated");
  }
};
