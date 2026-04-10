const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

/**
 * Get creative advice from the AI assistant via backend proxy.
 * This keeps the API key secure on the server.
 */
export const getCreativeAdvice = async (userPrompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userPrompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI Service Error:', error);
    return "I'm currently perfecting our creative roadmap. Please reach out to our Mohali office directly.";
  }
};
