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
 * Robust retry utility for handling transient API failures (5xx, XHR errors).
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      
      // Pass through our custom configuration errors directly
      if (errorMsg.includes("API_KEY_MISSING")) {
        throw error;
      }

      const isQuotaError = errorMsg.includes("429") || error?.status === "RESOURCE_EXHAUSTED" || errorMsg.toLowerCase().includes("quota");
      const isTransientError = error?.code === 500 || error?.status === 500 || error?.status === 503 || errorMsg.includes("xhr error") || errorMsg.includes("Rpc failed");

      if (isQuotaError) {
        throw new Error("QUOTA_EXCEEDED: The AI engine is currently at capacity. Please wait a minute and try again.");
      }

      if (isTransientError && attempt < maxRetries) {
        attempt++;
        const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`Gemini API transient error (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error("Gemini API Terminal Error:", error);
      throw error;
    }
  }
  throw new Error("API_RETRY_FAILED: Failed to get response after multiple attempts.");
}

export const suggestJobRoles = async (resumeText: string): Promise<string[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this resume text, suggest 5 specific job roles the candidate is best suited for.
      Resume: ${resumeText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const analyzeResume = async (resumeText: string, targetRole: string): Promise<ResumeAnalysisResult> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: `Analyze this resume for a ${targetRole} position:
      ${resumeText}
      Provide a detailed JSON analysis reflecting skill alignment, missing requirements, and a quality score.`,
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
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate exactly 3 coding challenges (Easy, Medium, Hard) suitable for a ${role} position. Include title, problem statement, and a boilerplate.`,
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
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Challenge: ${challenge.title}\nDescription: ${challenge.problemStatement}\n\nUser Solution:\n${userCode}\n\nEvaluate for logical correctness and efficiency.`,
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
    return JSON.parse(response.text || '{"isCorrect": false, "feedback": "Evaluation failed."}');
  });
};

export const evaluateFinalReadiness = async (
  resumeScore: number,
  technicalScore: number,
  interviewTranscript: string,
  cheated: boolean
): Promise<ReadinessScore> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Resume Audit Score: ${resumeScore}\nTechnical Assessment Score: ${technicalScore}\n\nInterview Transcript:\n${interviewTranscript}\n\nIntegrity Breach: ${cheated}\n\nProvide a comprehensive job readiness evaluation.`,
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
    return { ...result, isEligible: !cheated && technicalScore >= 60, methodologyNote: "Integrated AI Scoring v4.0" };
  });
};
