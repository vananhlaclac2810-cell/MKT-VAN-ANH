// app/api/chat/route.ts — API proxy gọi Gemini (OpenAI-compatible endpoint) với streaming.
// KHÔNG expose GEMINI_API_KEY ra client. Mọi request từ widget đi qua route này.

import { systemPrompt } from "@/lib/chatbot-knowledge";

export const runtime = "nodejs";

// Model. Gemini free-tier dùng được cho text. Đổi sang model khác nếu cần:
// - "gemini-2.5-flash" (mặc định, nhanh, free-tier ổn)
// - "gemini-2.5-pro"   (chất lượng cao hơn)
const MODEL = "gemini-2.5-flash";
const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY chưa được set trong .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: Msg[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0)
      throw new Error("empty messages");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid messages payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Giới hạn 20 lượt cuối để tiết kiệm token.
  const trimmed = messages.slice(-20);

  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...trimmed],
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "Unknown error");
    return new Response(
      JSON.stringify({ error: `AI service error ${upstream.status}: ${errText.slice(0, 200)}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pass-through SSE stream về client (định dạng OpenAI: data: {choices:[{delta:{content}}]}).
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
