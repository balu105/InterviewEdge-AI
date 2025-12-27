
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysisResult, ReadinessScore, CodingChallenge } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestJobRoles = async (resumeText: string): Promise<string[]> => {
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
};

export const analyzeResume = async (resumeText: string, targetRole: string): Promise<ResumeAnalysisResult> => {
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
};

export const generateCodingRound = async (role: string): Promise<CodingChallenge[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
};

export const evaluateCodeSubmission = async (challenge: CodingChallenge, userCode: string): Promise<{ isCorrect: boolean; feedback: string }> => {
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
};

export const evaluateFinalReadiness = async (
  resumeScore: number,
  technicalScore: number,
  interviewTranscript: string,
  cheated: boolean
): Promise<ReadinessScore> => {
  // If cheated, they are ineligible regardless of score
  const eligibilityFlag = !cheated && technicalScore >= 60; // 60% = 2/3 questions approx

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
  return { ...result, isEligible: eligibilityFlag };
};
