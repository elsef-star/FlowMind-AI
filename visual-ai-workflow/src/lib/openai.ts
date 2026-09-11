import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function evaluatePrompt(
  prompt: string,
  input: string
): Promise<"YES" | "NO"> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          'You are a binary decision engine. You must answer ONLY with "YES" or "NO". No other text, no punctuation, no explanation. Just the single word YES or NO.',
      },
      {
        role: "user",
        content: `Given the following context/input:\n\n${input}\n\nEvaluate this prompt: ${prompt}\n\nAnswer with YES or NO only.`,
      },
    ],
  });

  const answer = (response.choices[0]?.message?.content || "")
    .trim()
    .toUpperCase();

  if (answer.startsWith("YES")) return "YES";
  return "NO";
}