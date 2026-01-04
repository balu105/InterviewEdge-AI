
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysisResult, ReadinessScore, CodingChallenge } from "../types";

/**
 * Helper to get a fresh AI instance.
 * Guidelines require new instance per call for Gemini 3 / Veo workflows.
 */
const getAI = () => {
  // Check both standard and VITE_ prefixed environment variables
  const apiKey = process.env.API_KEY || (process.env as any).VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("MISSING_API_KEY: Ensure API_KEY or VITE_API_KEY is set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Common error handler for Gemini API calls to identify quota issues.
 */
const handleApiError = (error: any) => {
  console.error("Gemini API Error:", error);
  if (error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota")) {
    throw new Error("QUOTA_EXCEEDED: The AI engine is currently at capacity. Please wait a minute and try again.");
  }
  throw error;
};

export const suggestJobRoles = async (resumeText: string): Promise<string[]> => {
  try {
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
  } catch (error) {
    return handleApiError(error);
  }
};

export const analyzeResume = async (resumeText: string, targetRole: string): Promise<ResumeAnalysisResult> => {
  try {
    const ai = getAI();
    // Using flash instead of pro to avoid quota exhaustion for standard analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Analyze this resume for a ${targetRole} position:
      ${resumeText}
      Provide a detailed JSON analysis.`,
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
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateCodingRound = async (role: string): Promise<CodingChallenge[]> => {
  try {
    const ai = getAI();
    // Using flash for faster response and higher quota availability
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate exactly 3 coding challenges for a ${role} position. 
      CONSTRAINTS: 
      1. Topics MUST ONLY be from: Strings, Arrays, Stack, Queues, Linked Lists.
      2. Language MUST be relevant to ${role}.
      3. Provide boilerplate code.
      4. Provide clear problem statements and example I/O.`,
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
  } catch (error) {
    return handleApiError(error);
  }
};

export const evaluateCodeSubmission = async (challenge: CodingChallenge, userCode: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate this coding solution.
      Problem: ${challenge.problemStatement}
      Topic: ${challenge.topic}
      User Code: ${userCode}
      Does it correctly solve the problem with proper logic? Return JSON.`,
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
  } catch (error) {
    return handleApiError(error);
  }
};

export const evaluateFinalReadiness = async (
  resumeScore: number,
  technicalScore: number,
  interviewTranscript: string,
  cheated: boolean
): Promise<ReadinessScore> => {
  try {
    const ai = getAI();
    const eligibilityFlag = !cheated && technicalScore >= 60;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate job readiness. 
      Resume: ${resumeScore}%, Technical: ${technicalScore}%, Cheated: ${cheated}. 
      Transcript: ${interviewTranscript}`,
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
    return { ...result, isEligible: eligibilityFlag, methodologyNote: "Integrated AI Scoring" };
  } catch (error) {
    return handleApiError(error);
  }
};
