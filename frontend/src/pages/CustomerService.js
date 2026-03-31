import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

// Quick suggestion buttons for common queries
const QUICK_SUGGESTIONS = [
  "Track my order",
  "Return policy",
  "Payment methods",
  "Delivery charges",
  "Refund status",
  "Change my password",
  "Cancel my order",
  "Contact human support"
];

function CustomerService() {

  const { user, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
  document.title = "Qyro Customer Service";
}, []);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading]);

  // Load chat history on mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Load chat history from backend */
  const loadChatHistory = async () => {
    try {
      const res = await API.get("/chat/history");
      if (res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        // Show welcome message if no history
        setMessages([{
          role: "assistant",
          content: `Hello${user ? `, ${user.name}` : ""}! 👋 I'm Qyro AI assistant.\n\nI can help you with orders, returns, payments, delivery and more.\n\nHow can I help you today?`
        }]);
      }
    } catch (error) {
      console.error("Load chat history error:", error);
      setMessages([{
        role: "assistant",
        content: "Hello! 👋 I'm Qyro AI assistant. How can I help you today?"
      }]);
    } finally {
      setHistoryLoading(false);
    }
  };

  /* Send message — now calls backend which calls Gemini securely */
  const sendMessage = async (text) => {

    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {

      // Send to backend — backend handles Gemini call securely
      const res = await API.post("/chat/send", {
        message: messageText,
        // Send conversation history for context
        history: messages.filter(m => m.role !== undefined)
      });

      const assistantMessage = {
        role: "assistant",
        content: res.data.response
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Send message error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again or contact support@qyro.com"
      }]);
    } finally {
      setLoading(false);
    }

  };

  /* Clear chat history */
  const clearChat = async () => {
    if (!window.confirm("Clear all chat history?")) return;
    try {
      await API.delete("/chat/clear");
      setMessages([{
        role: "assistant",
        content: "Chat history cleared. How can I help you today?"
      }]);
    } catch (error) {
      console.error("Clear chat error:", error);
    }
  };

  // Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading || historyLoading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px 24px",
      height: "calc(100vh - 100px)",
      display: "flex",
      flexDirection: "column"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <div>
          <h2 style={{ margin: 0 }}>🤖 Qyro AI Customer Service</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            AI Support — 24/7 available • Chat history saved for 7 days
          </p>
        </div>
        <button
          onClick={clearChat}
          style={{
            padding: "6px 14px",
            background: "#fee2e2",
            color: "#dc2626",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Clear Chat
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
            }}
          >

            {/* AI avatar */}
            {msg.role === "assistant" && (
             <div style={{
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#E91E63",   // 🔥 brand color
  color: "#fff",           // 🔥 white icon
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  marginRight: "8px",
  flexShrink: 0
}}>
  🤖
</div>
            )}

            {/* Message bubble */}
            <div style={{
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: msg.role === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: msg.role === "user"
  ? "#2f1d23"
  : "linear-gradient(135deg, #FCE4EC, #ffffff)",
color: msg.role === "user" ? "white" : "#111",
              fontSize: "14px",
              lineHeight: "1.6",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap"
            }}>
              {msg.content}
            </div>

            {/* User avatar */}
            {msg.role === "user" && (
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "#188038", color: "white",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "14px",
                marginLeft: "8px", flexShrink: 0
              }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#131921", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              🤖
            </div>
            <div style={{
              padding: "10px 14px", background: "white",
              borderRadius: "18px 18px 18px 4px",
              fontSize: "14px", color: "#888",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
            }}>
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION BUTTONS */}
      {!loading && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "10px"
        }}>
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              style={{
                padding: "6px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                fontSize: "12px",
                cursor: "pointer",
                color: "white",
                transition: "all 0.15s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#131921";
                e.target.style.color = "white";
                e.target.style.borderColor = "#131921";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                e.target.style.color = "white";
                e.target.style.borderColor = "#facc15";
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* INPUT AREA */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          rows={2}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "white",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            fontFamily: "inherit"
          }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: "0 20px",
            background: loading || !input.trim() ? "#facc15" : "#eab308",
            color: "black",
            border: "none",
            borderRadius: "10px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "20px",
            transition: "background 0.2s"
          }}
        >
          ➤
        </button>

      </div>

      {/* FOOTER */}
      <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "8px" }}>
        Chat history automatically deleted after 7 days • Urgent help: support@qyro.com
      </p>

    </div>
  );
}

export default CustomerService;
