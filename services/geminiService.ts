
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysisResult, ReadinessScore, CodingChallenge } from "../types";

/**
 * Helper to get a fresh AI instance.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: The Gemini API key is not configured in the environment. Please ensure API_KEY is set in your deployment settings.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust retry utility with exponential backoff and model-fallback capabilities.
 */
async function callWithRetry<T>(
  fn: (model: string) => Promise<T>, 
  primaryModel: string = 'gemini-3-pro-preview',
  fallbackModel: string = 'gemini-3-flash-preview',
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  let currentModel = primaryModel;

  while (attempt <= maxRetries) {
    try {
      return await fn(currentModel);
    } catch (error: any) {
      const errorMsg = error?.message || "";
      
      // Detect Quota/Rate Limit errors (429 / RESOURCE_EXHAUSTED)
      const isQuotaError = errorMsg.includes("429") || 
                           error?.status === "RESOURCE_EXHAUSTED" || 
                           errorMsg.toLowerCase().includes("quota") ||
                           errorMsg.includes("exhausted");

      if (isQuotaError) {
        attempt++;
        if (attempt <= maxRetries) {
          // Switch to Flash model after the first quota failure as it usually has 10x higher limits
          if (currentModel === primaryModel) {
            console.warn(`Pro model quota reached. Switching to high-throughput Flash model for current request...`);
            currentModel = fallbackModel;
          }
          
          const delay = (Math.pow(2, attempt) * 1000) + (Math.random() * 1000);
          console.warn(`Quota cooling down. Retrying with ${currentModel} in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error("QUOTA_EXCEEDED: Your API key's current capacity is full. Even Pro tiers have minute-based limits. Please wait 60 seconds.");
      }

      // Handle transient 5xx errors
      const isTransient = error?.status >= 500 || errorMsg.includes("xhr error") || errorMsg.includes("Rpc failed");
      if (isTransient && attempt < maxRetries) {
        attempt++;
        const delay = 2000 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error("API_RETRY_FAILED: Assessment engine timed out.");
}

export const suggestJobRoles = async (resumeText: string): Promise<string[]> => {
  return callWithRetry(async (model) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: `Suggest 5 specific job roles based on this resume: ${resumeText.substring(0, 4000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }, 'gemini-3-flash-preview'); // Always use Flash for suggestions to save Pro quota
};

export const analyzeResume = async (resumeText: string, targetRole: string): Promise<ResumeAnalysisResult> => {
  return callWithRetry(async (model) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this resume for a ${targetRole} position:
      ${resumeText}
      Provide JSON: skills[], missingSkills[], score (0-100), suggestions[], education, experience.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            education: { type: Type.STRING },
            experience: { type: Type.STRING }
          },
          required: ['skills', 'missingSkills', 'score', 'suggestions', 'education', 'experience']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateCodingRound = async (role: string): Promise<CodingChallenge[]> => {
  return callWithRetry(async (model) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 3 coding challenges (Easy, Medium, Hard) for a ${role} role in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              problemStatement: { type: Type.STRING },
              constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
              exampleInput: { type: Type.STRING },
              exampleOutput: { type: Type.STRING },
              topic: { type: Type.STRING },
              boilerplate: { type: Type.STRING }
            },
            required: ['id', 'title', 'problemStatement', 'topic', 'boilerplate']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const evaluateCodeSubmission = async (challenge: CodingChallenge, userCode: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  return callWithRetry(async (model) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: `Evaluate this solution for '${challenge.title}':\n${userCode}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ['isCorrect', 'feedback']
        }
      }
    });
    return JSON.parse(response.text || '{"isCorrect": false, "feedback": "Evaluation logic failed."}');
  });
};

export const evaluateFinalReadiness = async (
  resumeScore: number,
  technicalScore: number,
  interviewTranscript: string,
  cheated: boolean
): Promise<ReadinessScore> => {
  return callWithRetry(async (model) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: `Overall evaluation based on:
      Resume: ${resumeScore}
      Code: ${technicalScore}
      Interview: ${interviewTranscript}
      Integrity Breach: ${cheated}
      Provide detailed career readiness verdict in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall: { type: Type.NUMBER },
            resume: { type: Type.NUMBER },
            technical: { type: Type.NUMBER },
            communication: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ['overall', 'resume', 'technical', 'communication', 'feedback']
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return { ...result, isEligible: !cheated && (result.overall >= 70), methodologyNote: `Processed via ${model} Intelligence Tier` };
  });
};
