import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, X, Loader2, Sparkles, Receipt, TrendingUp } from "lucide-react";
import api from "../../../core/utils/api";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI Financial Advisor. How can I help you manage your wealth today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await api.post("/ai/chat", { message: userMsg });
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: response.data.data.answer },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to my neural network right now. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const QuickAction = ({ icon: Icon, text, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg whitespace-nowrap hover:bg-slate-100 hover:border-slate-300 transition-all font-medium text-slate-700"
    >
      <Icon className="w-3.5 h-3.5 text-indigo-500" />
      {text}
    </button>
  );

  const handleQuickAction = (action) => {
    setMessage(action);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all z-50 group border border-indigo-400/30"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Advisor
          </span>
        </button>
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">Neural Wealth Advisor</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Systems Online
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 scroll-smooth bg-slate-50/30">
          <div className="space-y-6">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                    msg.role === "user"
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-indigo-100 border-indigo-200 text-indigo-600"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-sm"
                      : msg.isError
                      ? "bg-rose-50 text-rose-700 border border-rose-100 rounded-tl-sm"
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions & Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
            <QuickAction
              icon={TrendingUp}
              text="Analyze last month's spending"
              onClick={() => handleQuickAction("Can you analyze my spending for the last 30 days?")}
            />
            <QuickAction
              icon={Receipt}
              text="Create a budget"
              onClick={() => handleQuickAction("Can you recommend a monthly budget based on my data?")}
            />
          </div>

          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about your finances..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder-slate-400"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!message.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <div className="mt-3 text-center">
             <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
               Powered by Groq LPUs
             </p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AIAssistant;
