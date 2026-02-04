# HireAI | Celestial Enterprise Suite
### AI-Based Student Interview Readiness & Skill Enrichment Platform
**Authors:** K.C.BALAJI (22G31A3138), P.RAJESH NAIDU (22G31A3167), G.UDAY KIRAN (22G31A3130), S.MALLIKARJUNA (22G31A3172)

---

## 📑 1. Executive Summary
**HireAI** is a cutting-edge, multi-modal artificial intelligence framework designed to revolutionize the institutional placement process. By integrating Google's **Gemini 3.0 Pro** and **Gemini 2.5 Native Audio** ecosystems, the platform creates a "Digital Twin" of a professional recruitment cycle. It provides students with a high-fidelity environment to measure their technical aptitude, resume integrity, and behavioral resonance against real-world industry benchmarks.

---

## 🏗️ 2. Comprehensive System Architecture

### 2.1 The Quad-Layer Infrastructure
1.  **Presentation Layer (UI/UX):** Built with **React 19**, utilizing a "Glassmorphic Celestial" design language.
2.  **Intelligence Layer (AI Engine):** Powered by Gemini 3.0 and Gemini 2.5 APIs.
3.  **Persistence Layer (Database):** **Supabase (PostgreSQL)** handles authentication and records.
4.  **Security Layer (Proctoring):** Monitors integrity during assessments.

---

## 🗄️ 3. Database Setup & Administration

To enable the **Placement Officer Dashboard**, you must first initialize the admin registry table and add at least one authorized user.

### 3.1 Create Admin Table (Supabase SQL Editor)
```sql
-- 1. Create the placement portal admins table
CREATE TABLE IF NOT EXISTS placement_portal_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    department TEXT,
    designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 2. Enable Row Level Security (Optional but recommended)
ALTER TABLE placement_portal_admins ENABLE ROW LEVEL SECURITY;
```

### 3.2 Add One Admin Record (Foolproof Method)
The `user_id` column requires a **UUID**, not an email. If you try to insert an email directly, you will get a "22P02: invalid input syntax" error. Use the following query to automatically find the ID associated with an email:

```sql
-- 1. First, create an account normally in your app's Register page or Supabase Auth tab.
-- 2. Then run this query to promote that account to a Placement Officer:

INSERT INTO placement_portal_admins (user_id, full_name, department, designation)
SELECT id, 'BALAJI', 'Placement & Training', 'Placement Director'
FROM auth.users
WHERE email = 'balaji918214@gmail.com'
LIMIT 1;
```

---

## 🚀 4. Detailed Functional Modules

### Phase 01: Target Calibration (The Goal Engine)
The system begins by defining the "Assessment Target." Users can choose from pre-defined tracks or use AI Mapping.

### Phase 02: Neural Semantic Auditing (Resume Module)
Uses Gemini 3.0 for skill density mapping and gap analysis.

### Phase 03: The Technical Forge (Code Module)
High-stakes algorithmic assessment with tab-switch proctoring.

### Phase 04: Session Interaction (Live Interview Module)
Low-latency voice interaction via Gemini Live API.

---

## 📊 5. The Readiness Coefficient
Weighted formula: Resume (30%), Technical (40%), Communication (30%). Integrity breach results in immediate "Calibration Required" status.

---

## 🛡️ 6. Security and Ethics
- **Data Privacy:** Encrypted at rest.
- **Role Isolation:** Placement Officers have a dedicated login without registration to prevent unauthorized access.
- **Integrity Enforcement:** Proctored technical forge ensures merit-based evaluation.

---
**© 2025 HireAI Team | Celestial Enterprise Suite**