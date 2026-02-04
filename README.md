# HireAI | Celestial Enterprise Suite
### AI-Based Student Interview Readiness & Skill Enrichment Platform
**Authors:** K.C.BALAJI (22G31A3138), P.RAJESH NAIDU (22G31A3167), G.UDAY KIRAN (22G31A3130), S.MALLIKARJUNA (22G31A3172)

---

## 📑 1. Executive Summary
**HireAI** is a cutting-edge, multi-modal artificial intelligence framework designed to revolutionize the institutional placement process. By integrating Google's **Gemini 3.0 Pro** and **Gemini 2.5 Native Audio** ecosystems, the platform creates a "Digital Twin" of a professional recruitment cycle. It provides students with a high-fidelity environment to measure their technical aptitude, resume integrity, and behavioral resonance against real-world industry benchmarks.

---

## 🏗️ 2. Comprehensive System Architecture

### 2.1 The Quad-Layer Infrastructure
1.  **Presentation Layer (UI/UX):** Built with **React 19**, utilizing a "Glassmorphic Celestial" design language. It leverages **Tailwind CSS** for responsive layouts and **Recharts** for visualizing high-dimensional skill vectors.
2.  **Intelligence Layer (AI Engine):** The heart of the platform. It utilizes **Gemini 3.0 Pro-Preview** for complex reasoning (coding/resume audit) and **Gemini 2.5 Flash-Native-Audio** for real-time voice synthesis and analysis.
3.  **Persistence Layer (Database):** **Supabase (PostgreSQL)** handles user authentication, session history, and assessment records. It utilizes row-level security (RLS) to ensure data isolation.
4.  **Security Layer (Proctoring):** A custom-built **Browser Visibility Observer** that monitors tab switches and window focus, creating a verifiable "Integrity Index" for every student.

---

## 🚀 3. Detailed Functional Modules (Inch-by-Inch)

### Phase 01: Target Calibration (The Goal Engine)
The system begins by defining the "Assessment Target." Users can choose from pre-defined tracks (MERN, Python, Java, Data Science) or use **AI Mapping** where the system analyzes their resume to suggest the 5 most statistically relevant job roles.

### Phase 02: Neural Semantic Auditing (Resume Module)
Unlike standard keyword parsers, HireAI uses **Semantic Vector Extraction**. 
- **Skill Density Mapping:** Identifies not just listed keywords, but the "contextual depth" of projects.
- **Gap Analysis:** Gemini 3.0 identifies "Missing Critical Vectors"—skills the industry expects for the target role that are absent in the resume.
- **Affinity Scoring:** Generates a percentage score based on the mathematical alignment between the resume and the target job description.

### Phase 03: The Technical Forge (Code Module)
A high-stakes algorithmic assessment environment.
- **Dynamic Challenge Generation:** Challenges are generated in real-time based on the role (e.g., a Data Analyst gets SQL/Python, a Backend Dev gets Stack/Queue problems).
- **Proctored Environment:** The system detects if a user leaves the window to search for answers, immediately flagging the "Integrity Breach" status.
- **Automated Logic Evaluation:** Code is evaluated for time complexity, space complexity, and logical correctness using LLM-based reasoning.

### Phase 04: Session Interaction (Live Interview Module)
This is the most advanced feature of the platform, utilizing the **Gemini Live API**.
- **Native Audio Streaming:** The system streams raw PCM audio chunks back and forth, enabling human-like conversation with <500ms latency.
- **Multi-Modal Feedback:** The AI evaluates not just the text of the answer, but the "Behavioral Trait" (confidence, clarity, technical jargon usage).
- **Audio Transcription:** Real-time transcription of both the AI interviewer and the student is displayed to provide visual feedback.

---

## 📊 4. The Readiness Coefficient (Logic Flow)
The final "Verdict" is not a simple average. It uses a **Weighted Multi-Modal Formula**:
- **Resume Affinity (30%):** Measures historical preparation.
- **Technical Rigor (40%):** Measures logical implementation capability.
- **Communication Clarity (30%):** Measures behavioral soft skills.

**The Integrity Filter:** If the `integrity_breach` flag is `true`, the candidate is marked as "CALIBRATION REQUIRED" regardless of the score, enforcing professional ethics.

---

## 🏛️ 5. Institutional Placement Portal (Director Console)
A dedicated environment for Placement Officers (TPOs):
- **Cohort Yield Monitoring:** View the overall readiness of the entire college/department.
- **Registry Drill-Down:** Officers can click on any student to view their **full session transcript**, code submissions, and detailed AI feedback.
- **Security Alerts:** Immediate flagging of students who cheated during the Technical Forge.

---

## 🛠️ 6. Technical Implementation Details

### Voice Technology (Live API Implementation)
The platform handles raw 16-bit PCM audio. 
- **Input:** 16kHz Mono audio captured via `MediaStreamSource`.
- **Processing:** Encoded to Base64 and sent to the Gemini session via `sendRealtimeInput`.
- **Output:** 24kHz Mono audio received from Gemini, decoded, and scheduled into the `AudioContext` using a `nextStartTime` cursor to ensure gapless playback.

### Database Schema (Supabase)
- **`resumes`:** Stores skill vectors, education details, and target role mapping.
- **`assessments`:** Stores overall scores, technical scores, interview transcripts, and code submissions.
- **`placement_portal_admins`:** Manages authorized faculty access.

---

## 🛡️ 7. Security and Ethics
- **Data Privacy:** Personal contact information is only visible to authorized Placement Directors.
- **Model Neutrality:** System instructions for Gemini are tuned to provide unbiased, professional feedback.
- **Isolation:** Strict code-level separation ensures a Student account can never spoof Faculty-level permissions.

---

## 🏁 8. Conclusion
HireAI is more than a tool; it is a **Placement Readiness Ecosystem**. It provides students with the "Readiness IQ" needed to dominate the modern job market, while providing colleges with a powerful, data-driven dashboard to improve their placement percentages through targeted skill enrichment.

---
**© 2025 HireAI Team | Celestial Enterprise Suite**