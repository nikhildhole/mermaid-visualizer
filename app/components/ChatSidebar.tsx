"use client";

import { useState } from "react";

export default function ChatSidebar() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userText = input;
    setInput("");

    try {
      const res = await fetch("http://192.168.1.11:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText }),
      });

      if (!res.ok) {
        throw new Error("Bad response from server");
      }

      const data = await res.json();

      const botMessage = {
        sender: "bot",
        text: data.answer || data.result || JSON.stringify(data),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error: could not reach server." },
      ]);
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
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${msg.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
            >
              {msg.text}
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
