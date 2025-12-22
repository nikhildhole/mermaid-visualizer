"use client";

import { useState, useEffect } from "react";
import { getUserId } from "../utils/userId";

type Message = {
  sender: "user" | "bot";
  text: string;
  events?: Array<{ type: string; message: string; agent?: string; result?: string }>;
};

export default function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Get or generate user ID on component mount
    setUserId(getUserId());
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userText = input;
    setInput("");

    // Add a placeholder for the bot's streaming response
    const botMessageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { sender: "bot", text: "", events: [] }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText, userId }),
      });

      if (!res.ok) {
        throw new Error("Bad response from server");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      const events: Array<{ type: string; message: string; agent?: string; result?: string }> = [];
      let finalResult = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              // Capture all events
              events.push(data);

              // Extract final result if available
              if (data.type === "agent_complete" && data.result) {
                finalResult = data.result;
              }

              // Update the bot message in real-time with all events
              setMessages((prev) => {
                const updated = [...prev];
                updated[botMessageIndex] = {
                  sender: "bot",
                  text: finalResult,
                  events: [...events],
                };
                return updated;
              });
            } catch (e) {
              // Ignore parse errors for incomplete lines
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[botMessageIndex] = {
          sender: "bot",
          text: "❌ Error: could not reach server.",
          events: [],
        };
        return updated;
      });
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-md text-sm ${msg.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
            >
              {/* Show events in a collapsible section if they exist */}
              {msg.events && msg.events.length > 0 && (
                <details className="mb-2 text-xs">
                  <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-800">
                    🔍 Show workflow events ({msg.events.length})
                  </summary>
                  <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-400">
                    {msg.events.map((event, idx) => (
                      <div key={idx} className="text-gray-700">
                        {event.type === "start" && (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-500">🔄</span>
                            <span>{event.message}</span>
                          </div>
                        )}
                        {event.type === "agent_complete" && (
                          <div className="flex items-start gap-1 flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-green-500">✅</span>
                              <span className="font-medium">{event.agent}</span>
                            </div>
                            <span className="text-xs text-gray-600 ml-4">{event.message}</span>
                          </div>
                        )}
                        {event.type === "complete" && (
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">✅</span>
                            <span className="font-semibold">{event.message}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {/* Main message text */}
              <div>{msg.text || "Processing..."}</div>
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      <div className="border-t border-gray-300 p-3 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
