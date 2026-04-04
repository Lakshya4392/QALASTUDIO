import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are the AI Creative Consultant for Qala Studios in Mohali, Punjab. 
Your goal is to help production teams plan their photo or video shoots in the North Indian region. 
Suggest specific features of Qala Studios and its new branch "Golden Hour Studios" like: 
- Large soundstages for Pollywood music videos
- Virtual Production LED walls (Megaverse) for cinematic shots
- Golden Hour Studios branch: Specifically designed sets for pre-wedding, fashion, and cinematic shoots with curated lighting environments (Vintage, Modern, Royal, etc.)
- Equipment rental (high-end cameras like Alexa/RED, lighting)
- Location scouting in Chandigarh and Mohali areas
- On-site hospitality and logistics support.
Keep responses professional, minimalist, and inspiring. Max 100 words. Mention Mohali context where relevant.`;

export class AIService {
    async getCreativeAdvice(userPrompt: string): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            const result = await model.generateContent({
                contents: [
                    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + userPrompt }] }
                ]
            });

            const response = result.response;
            return response.text() || 'I am currently perfecting our creative roadmap. Please reach out to our Mohali office directly.';
        } catch (error) {
            console.error('Gemini Error:', error);
            return 'I am currently perfecting our creative roadmap. Please reach out to our Mohali office directly.';
        }
    }
}
