import { Router } from 'express';
import { generateCaseSummary, chatWithLegalAssistant } from '../services/ai';

const router = Router();

router.post('/summary', async (req, res) => {
    try {
        const { title, type, description } = req.body;
        if (!title || !type || !description) {
            return res.status(400).json({ error: 'Missing required fields: title, type, description' });
        }

        const summary = await generateCaseSummary({ title, type, description });
        res.json(summary);
    } catch (error) {
        console.error('Error in /summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ 
                "ERROR": "Missing required field: message",
                "1. Jurisdiction": "Not applicable",
                "2. Applicable Law": "Not applicable",
                "3. Legal Issue Identified": "Invalid request format",
                "4. Available Legal Options": "Provide message in request",
                "5. Eligibility Conditions": "Not applicable",
                "6. Documents / Evidence Required": "Not applicable",
                "7. Procedural Roadmap": "Step 1: Provide valid message\nStep 2: Try again",
                "8. Next Required User Action": "Provide message field in request",
                "DISCLAIMER": "Informational assistance only. This is not legal advice. Consultation with a qualified advocate is required."
            });
        }

        const response = await chatWithLegalAssistant(message, history);
        
        // Try to parse and return as JSON
        try {
            const parsedResponse = JSON.parse(response);
            res.json(parsedResponse);
        } catch (parseError) {
            // If parsing fails, return as plain text with content-type
            res.setHeader('Content-Type', 'application/json');
            res.send(response);
        }
    } catch (error) {
        console.error('Error in /chat:', error);
        res.status(500).json({
            "ERROR": "Legal assistant service unavailable",
            "1. Jurisdiction": "Not applicable",
            "2. Applicable Law": "Not applicable",
            "3. Legal Issue Identified": "Service error occurred",
            "4. Available Legal Options": "Try again later or consult advocate directly",
            "5. Eligibility Conditions": "Not applicable",
            "6. Documents / Evidence Required": "Not applicable",
            "7. Procedural Roadmap": "Step 1: Refresh and try again\nStep 2: Contact support if issue persists\nStep 3: Consult qualified advocate",
            "8. Next Required User Action": "Try again or consult qualified advocate",
            "DISCLAIMER": "Informational assistance only. This is not legal advice. Consultation with a qualified advocate is required."
        });
    }
});

export default router;
