import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is missing from .env");
    process.exit(1);
}

const runTest = async () => {
    try {
        console.log("Initializing Gemini Client...");
        const genAI = new GoogleGenerativeAI(apiKey);

        // Test gemini-flash-latest
        const modelName = "gemini-flash-latest";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`SUCCESS: ${modelName} responded:`, response.text());

    } catch (error: any) {
        console.error("FAILED to connect to Gemini API:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
    }
};

runTest();
