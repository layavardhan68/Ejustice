import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// import { CaseUrgency } from '../schema'; 


dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

interface CaseSummary {
    facts: string;
    legalIssue: string;
    reliefSought: string;
    urgency: 'low' | 'medium' | 'high';
    urgencyReason: string;
}

export const generateCaseSummary = async (caseDetails: { title: string, type: string, description: string }): Promise<CaseSummary> => {
    const prompt = `
    You are a legal AI assistant capable of summarizing complex legal case descriptions into structured formats.
    
    Case Details:
    Title: ${caseDetails.title}
    Type: ${caseDetails.type}
    Description: ${caseDetails.description}
    
    Analyze the provided case details and generate a JSON summary with the following fields:
    - facts: A concise summary of the key facts of the case.
    - legalIssue: The core legal question or issue at hand.
    - reliefSought: What the plaintiff is asking for.
    - urgency: One of 'low', 'medium', 'high'. Assess based on keywords like "immediate", "threat", "eviction", "harassment", etc.
    - urgencyReason: A brief explanation for the urgency level.

    Return ONLY raw JSON, no markdown formatting.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr) as CaseSummary;
    } catch (error) {
        console.error("Error generating case summary:", error);
        throw new Error("Failed to generate case summary");
    }
};

export const chatWithLegalAssistant = async (message: string, history: { role: string, parts: string }[] = []): Promise<string> => {
   const systemInstruction = `
You are "Judicial Navigator", a STRICT legal assistant for Indian law.
You function like a junior advocate assisting in case preparation — NOT like a general chatbot.

ROLE & BEHAVIOR RULES (MANDATORY):
1. You MUST first collect legally relevant facts before giving legal guidance.
2. You MUST NOT give full legal explanations without confirming jurisdiction, applicable law, and key facts.
3. You MUST think in terms of procedure, eligibility, and next legal action.
4. You MUST respond in structured legal format, not long narrative paragraphs.
5. You MUST behave like a court/legal professional — neutral, precise, and procedural.
6. You MUST always anchor answers to Indian statutes, sections, and court processes.
7. You MUST NOT provide emotional counseling, motivational language, or casual conversation.

INTAKE-FIRST RULE:
If the user query lacks essential facts (e.g., religion, consent, location, timeline),
your response MUST begin with a "Preliminary Legal Intake" section and ask targeted questions.
Do NOT explain the law fully until intake is complete.

OUTPUT FORMAT (MANDATORY):
All responses MUST follow this format:

---
PRELIMINARY LEGAL INTAKE / LEGAL ASSESSMENT

(Depending on available information)

1. Jurisdiction:
2. Applicable Law:
3. Legal Issue Identified:
4. Available Legal Options (with Sections):
5. Eligibility Conditions:
6. Documents / Evidence Required:
7. Procedural Roadmap (Step-by-step):
8. Next Required User Action:
---

TONE:
- Formal
- Precise
- Court-oriented
- No emojis
- No storytelling
- No unnecessary background explanations

DISCLAIMER (MANDATORY AT END):
"Informational assistance only. This is not legal advice. Consultation with a qualified advocate is required."

OUTPUT RULE (MANDATORY):
You MUST respond ONLY in valid JSON.
Do NOT use Markdown.
Do NOT use *, **, -, |, or bullet symbols.
All formatting must be via JSON keys and values.

SCOPE:
- Indian Family Law
- Property and Civil disputes
- Court procedures and filing guidance
- Tenant and contractual matters

If the user insists on advice without providing facts, repeat intake request.
`;


    // Convert history format if needed, but for simple chat generation we can just use the chat session
    // Mapping simplified for this implementation
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemInstruction }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am the Judicial Navigator, ready to assist citizens with legal information and court protocols found in the e-Justice framework." }],
            },
            // Add previous history here if we were persisting it properly, for now assuming stateless or client-passed history
        ],
    });

    try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        let responseText = response.text();
        
        // Try to parse as JSON, if fails, wrap in proper structure
        try {
            const parsed = JSON.parse(responseText);
            return JSON.stringify(parsed, null, 2);
        } catch (parseError) {
            // If not valid JSON, wrap in proper legal structure
            const legalResponse = {
                "PRELIMINARY_LEGAL_INTAKE": "Information provided is insufficient for detailed legal guidance",
                "1. Jurisdiction": "To be determined based on location",
                "2. Applicable Law": "To be determined based on case details",
                "3. Legal Issue Identified": responseText.substring(0, 200) + "...",
                "4. Available Legal Options": "Consultation with advocate required",
                "5. Eligibility Conditions": "To be assessed",
                "6. Documents / Evidence Required": "To be determined",
                "7. Procedural Roadmap": "Step 1: Consult qualified advocate\nStep 2: Provide complete case details\nStep 3: Submit required documents",
                "8. Next Required User Action": "Consult with a qualified legal advocate",
                "DISCLAIMER": "Informational assistance only. This is not legal advice. Consultation with a qualified advocate is required."
            };
            return JSON.stringify(legalResponse, null, 2);
        }
    } catch (error) {
        console.error("Error in legal assistant chat:", error);
        const errorResponse = {
            "ERROR": "Legal assistant temporarily unavailable",
            "1. Jurisdiction": "Not applicable",
            "2. Applicable Law": "Not applicable", 
            "3. Legal Issue Identified": "Service error occurred",
            "4. Available Legal Options": "Try again later or consult advocate directly",
            "5. Eligibility Conditions": "Not applicable",
            "6. Documents / Evidence Required": "Not applicable",
            "7. Procedural Roadmap": "Step 1: Refresh and try again\nStep 2: Contact support if issue persists\nStep 3: Consult qualified advocate",
            "8. Next Required User Action": "Try again or consult qualified advocate",
            "DISCLAIMER": "Informational assistance only. This is not legal advice. Consultation with a qualified advocate is required."
        };
        return JSON.stringify(errorResponse, null, 2);
    }
};
