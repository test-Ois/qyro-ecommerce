import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

function ChatWidget() {

  const { user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hi${user ? ` ${user.name}` : ""}! 👋 How can I help you today?`
      }]);
    }
  }, [isOpen, messages.length, user]);

  const sendMessage = async () => {

    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chat/send", {
        message: userMessage.content,
        history: messages.filter(m => m.role !== undefined)
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.response
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">

      {isOpen && (
        <div className="w-[320px] h-[440px] rounded-2xl shadow-2xl flex flex-col mb-3 overflow-hidden 
                        bg-[#0f0a1e] border border-white/10">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <div className="text-sm font-semibold">Qyro Support</div>
                <div className="text-xs text-pink-100">AI — Always online</div>
              </div>
            </div>
            <span onClick={() => setIsOpen(false)} className="cursor-pointer text-lg">✖</span>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-white/5">

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                
                <div className={`max-w-[80%] px-3 py-2 text-sm rounded-lg
                  ${msg.role === "user"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                    : "bg-white/5 text-white border border-white/10"
                  }`}>
                  {msg.content}
                </div>

              </div>
            ))}

            {/* Typing Animation */}
            {loading && (
              <div className="flex">
                <div className="bg-white/5 px-3 py-2 rounded-lg flex gap-1 border border-white/10">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-2 border-t border-white/10 flex gap-2 bg-[#0f0a1e]">
            
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-full text-sm outline-none
                         bg-white/5 text-white placeholder-gray-400
                         border border-white/10 caret-brand"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center
                ${loading || !input.trim()
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                }`}
            >
              ➤
            </button>

          </div>

        </div>
      )}

      {/* FLOAT BUTTON */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl cursor-pointer
                   bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-xl text-black"
      >
        {isOpen ? "✖" : "🤖"}
      </div>

    </div>
  );
}

export default ChatWidget;
