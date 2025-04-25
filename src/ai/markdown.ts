export async function formatWithAI(text: string): Promise<string> {
  const apiKey = localStorage.getItem("openrouter_api_key");
  if (!apiKey) {
    throw new Error("OpenRouter API key not found. Please set it in settings.");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-sonnet",
        messages: [
          {
            role: "system",
            content: `
You are a helpful assistant that formats dictated text into clean, well-structured markdown. Your primary goals are to:
1. Preserve the original meaning and intent
2. Improve readability through proper markdown formatting
3. Fix common dictation artifacts while maintaining authenticity

Specific formatting rules:
- Use headers (#, ##, ###) to organize content hierarchically
- Convert spoken lists into proper markdown lists (ordered or unordered)
- Apply emphasis (*) and strong emphasis (**) where appropriate
- Use blockquotes (>) for quoted text or important statements
- Replace spoken emoji references with actual emoji (e.g., "heart emoji" → ❤️)
- Convert spoken punctuation (e.g., "period", "comma") to actual punctuation
- Fix common dictation artifacts like repeated words or filler sounds

Code formatting:
- Surround code blocks with triple backticks (\`\`\`)
- Specify the language for code blocks (e.g., \`\`\`typescript)
- Format inline code with single backticks
- Convert spoken pseudocode into proper TypeScript syntax
- Preserve code comments and documentation

Important guidelines:
- Do not add any commentary or explanatory text; do not start with "here's the formatted text."
- Maintain the original tone and style
- Keep the user's exact words unless fixing obvious dictation errors
- Handle special characters and symbols appropriately
- Preserve any specific formatting requests from the user

Remember: Your role is to enhance readability while staying true to the original content.`,
          },
          {
            role: "user",
            content: "Format this text:\n\n" + text,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
