import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, AlertTriangle, ArrowRight, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatbotProps {
  currentStudioId?: string; // Optional context
  onTriggerBooking: (studioId: string) => void;
  onNavigateToServices: (studioId: string) => void;
  onNavigateToPackages: (studioId: string) => void;
  currentUser: any | null;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

function cleanBotText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, match => match.replace(/```/g, ""))
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\*{1,3}|_{1,3}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function Chatbot({
  currentStudioId,
  onTriggerBooking,
  onNavigateToServices,
  onNavigateToPackages,
  currentUser
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your AI Cainta Photography Guide. 🌟 How can I help you today? Ask me about operating hours, services, packages, photo booth accessories, or booking assistance!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { sender: "user", text: userText, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          studioId: currentStudioId || undefined,
          history: messages.slice(-6).map(m => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: "bot", text: cleanBotText(data.text), timestamp: new Date() }]);
      } else {
        throw new Error(data.message || "Failed to receive response");
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "I'm having a little trouble connecting right now. You can still browse our photo packages and book instantly with any Book Now button, or try sending your question again in a moment.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Parses special button triggers from chatbot message: e.g. [book_now:ST-LUMINA]
  const parseMessageText = (text: string) => {
    const parts = [];
    const regex = /\[(book_now|view_services|view_packages):([a-zA-Z0-9\-]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push({ type: "text", content: text.substring(lastIndex, matchIndex) });
      }

      const action = match[1];
      const targetId = match[2];

      parts.push({
        type: "action",
        action,
        targetId,
        label: action === "book_now" ? "Book Appointment Now" 
               : action === "view_services" ? "Browse Services Portfolio" 
               : "Explore Studio Packages"
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }];
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white border border-[#e5e1da] rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[420px] sm:h-[500px] max-h-[calc(100vh-160px)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#2c2a29] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-500 text-black p-1.5 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={14} className="fill-current" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm leading-tight">Cainta Photo Guide</h4>
                  <p className="text-[10px] text-gray-300">Powered by Gemini AI • Rizal MIS</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#faf9f6] space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      m.sender === "user"
                        ? "bg-[#2c2a29] text-[#faf9f6] rounded-br-none"
                        : "bg-white text-[#2c2a29] border border-[#e5e1da] rounded-bl-none"
                    }`}
                  >
                    {m.sender === "user" ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="space-y-2">
                        {parseMessageText(m.text).map((part, pIdx) => {
                          if (part.type === "text") {
                            return <p key={pIdx} className="leading-relaxed whitespace-pre-wrap">{part.content}</p>;
                          } else {
                            return (
                              <div key={pIdx} className="pt-1.5">
                                <button
                                  onClick={() => {
                                    if (part.action === "book_now") onTriggerBooking(part.targetId);
                                    if (part.action === "view_services") onNavigateToServices(part.targetId);
                                    if (part.action === "view_packages") onNavigateToPackages(part.targetId);
                                  }}
                                  className="w-full flex items-center justify-between gap-1.5 px-3 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 active:scale-95 transition-all text-[11px] uppercase tracking-wider"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Camera size={13} />
                                    {part.label}
                                  </span>
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                    <span className="block text-[8px] text-right mt-1 opacity-60">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#e5e1da] rounded-2xl rounded-bl-none px-4 py-3 text-xs shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#2c2a29] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#2c2a29] rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-[#2c2a29] rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#e5e1da] bg-white flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask your query here..."
                disabled={isLoading}
                className="flex-1 bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-[#2c2a29] hover:bg-[#4a4644] text-white rounded-xl active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Shutter Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#2c2a29] text-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden focus:outline-none cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <MessageSquare size={24} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
