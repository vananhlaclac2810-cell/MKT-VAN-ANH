"use client";

// Floating chatbot widget tư vấn Hasobaby — góc dưới phải, responsive 3 breakpoint.
// Mobile (≤640px): fullscreen overlay. Tablet/Desktop: panel anchored bottom-right.

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED_QUESTIONS = [
  "Con đi tiêm về sốt thì xịt sao ạ?",
  "Hasobaby giá bao nhiêu?",
  "Bé sơ sinh dùng được không?",
  "Mua combo nào lợi nhất?",
];

const WELCOME =
  "Em chào chị 👋 Em là trợ lý của Dr.Maya. Chị cần em tư vấn gì về Xịt Hạ Sốt Hasobaby ạ?";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open && window.matchMedia("(max-width: 640px)").matches) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((m) => {
                const last = m[m.length - 1];
                if (last.role !== "assistant") return m;
                return [
                  ...m.slice(0, -1),
                  { ...last, content: last.content + delta },
                ];
              });
            }
          } catch {
            /* bỏ qua chunk không parse được */
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(msg);
      setMessages((m) =>
        m[m.length - 1]?.role === "assistant" && !m[m.length - 1].content
          ? m.slice(0, -1)
          : m
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <>
      {/* Bubble trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở chatbot tư vấn Hasobaby"
          className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-soft transition hover:scale-105 active:scale-95 lg:h-16 lg:w-16"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7 lg:h-8 lg:w-8"
          >
            <path d="M12 2C6.48 2 2 6.04 2 11c0 2.28.93 4.36 2.5 6L3 21l4.4-1.42c1.4.65 2.97 1.02 4.6 1.02 5.52 0 10-4.04 10-9S17.52 2 12 2z" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-leaf-500" />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-cream shadow-2xl sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:h-[70vh] sm:w-[380px] sm:rounded-3xl sm:border sm:border-ink-line lg:h-[600px] lg:w-[400px]"
          role="dialog"
          aria-label="Chatbot tư vấn Hasobaby"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-coral-500 to-coral-600 px-4 py-3 text-white sm:rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.04 2 11c0 2.28.93 4.36 2.5 6L3 21l4.4-1.42c1.4.65 2.97 1.02 4.6 1.02 5.52 0 10-4.04 10-9S17.52 2 12 2z" />
                </svg>
              </span>
              <div>
                <div className="font-display text-base font-bold leading-tight">
                  Trợ lý Hasobaby
                </div>
                <div className="text-xs text-white/85">
                  Dr.Maya · trả lời trong vài giây
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng chatbot"
              className="rounded-full p-1.5 transition hover:bg-white/15 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && (
              <>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm text-ink shadow-card">
                  {WELCOME}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-coral-200 bg-white px-3 py-1.5 text-xs font-semibold text-coral-600 transition hover:bg-coral-100 active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 text-sm shadow-card ${
                  m.role === "user"
                    ? "ml-auto whitespace-pre-wrap rounded-tr-sm bg-coral-500 text-white"
                    : "chatbot-md rounded-tl-sm bg-white text-ink"
                }`}
              >
                {m.content ? (
                  m.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: (props) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-mint-700 underline underline-offset-2"
                          />
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )
                ) : streaming && i === messages.length - 1 ? (
                  <TypingDots />
                ) : (
                  ""
                )}
              </div>
            ))}

            {error && (
              <div className="rounded-xl bg-coral-100 px-3 py-2 text-xs text-coral-600">
                Có lỗi xảy ra. Chị thử lại sau ít phút, hoặc nhắn Messenger{" "}
                <a
                  href="https://m.me/hasobaby.drmaya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  m.me/hasobaby.drmaya
                </a>{" "}
                giúp em nhé.
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="border-t border-ink-line bg-white px-3 py-2.5"
            style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi cho em..."
                rows={1}
                disabled={streaming}
                className="max-h-32 flex-1 resize-none rounded-xl border-2 border-ink-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-coral-400 focus:bg-white focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                aria-label="Gửi tin nhắn"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-500 text-white transition hover:bg-coral-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-ink-line"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-ink-soft">
              Trợ lý AI — thông tin mang tính tham khảo
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-coral-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-coral-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-coral-400" />
    </span>
  );
}
