"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachPhilosophy = void 0;
const https_1 = require("firebase-functions/v2/https");
const vertexai_1 = require("@google-cloud/vertexai");
const schemas_js_1 = require("./schemas.js");
const systemPrompt_js_1 = require("./prompts/systemPrompt.js");
// Initialize Vertex AI
// Project ID will be auto-detected from Firebase environment
const vertexAI = new vertexai_1.VertexAI({
    project: process.env.GCLOUD_PROJECT || '',
    location: 'us-central1',
});
const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 1024,
    },
});
/**
 * Main coaching function
 *
 * Receives portfolio context, calls Gemini, validates response, streams back.
 */
exports.coachPhilosophy = (0, https_1.onCall)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    cors: true,
}, async (request) => {
    // 1. Validate request
    const parseResult = schemas_js_1.CoachRequestSchema.safeParse(request.data);
    if (!parseResult.success) {
        throw new https_1.HttpsError('invalid-argument', `Invalid request: ${parseResult.error.message}`);
    }
    const { context } = parseResult.data;
    // 2. Build prompt
    const prompt = (0, systemPrompt_js_1.buildPrompt)(context.targetPhilosophyId, context.holdings, context.netWorthCAD, context.yearsToFI, context.topPhilosophies, context.goals);
    // 3. Call Gemini
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new https_1.HttpsError('internal', 'Empty response from Gemini');
        }
        // 4. Parse and validate JSON response
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch {
            throw new https_1.HttpsError('internal', 'Gemini returned invalid JSON');
        }
        const validated = schemas_js_1.CoachResponseSchema.safeParse(parsed);
        if (!validated.success) {
            // Attempt to recover with defaults
            console.warn('Gemini response failed validation:', validated.error);
            // Return a safe fallback
            return {
                alignment: {
                    score: 50,
                    summary: 'Unable to fully analyze alignment at this time.',
                    strengths: [],
                    gaps: [],
                },
                actionPlan: [],
                philosophyInsight: 'Please try again or select a different philosophy.',
                disclaimer: schemas_js_1.DEFAULT_DISCLAIMER,
            };
        }
        // 5. Ensure disclaimer is present
        const finalResponse = {
            ...validated.data,
            disclaimer: validated.data.disclaimer || schemas_js_1.DEFAULT_DISCLAIMER,
        };
        return finalResponse;
    }
    catch (error) {
        console.error('Gemini call failed:', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to generate coaching response');
    }
});
//# sourceMappingURL=coachPhilosophy.js.map