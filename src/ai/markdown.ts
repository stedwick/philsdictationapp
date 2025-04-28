import { MARKDOWN_FORMATTING_PROMPT } from "./markdown_prompt";

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
            content: MARKDOWN_FORMATTING_PROMPT,
          },
          {
            role: "user",
            content: text,
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
