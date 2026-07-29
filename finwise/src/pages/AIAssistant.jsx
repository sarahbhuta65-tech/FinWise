import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./AIAssistant.css";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);

  const [chat, setChat] = useState([
    {
      sender: "ai",
      text: "👋 **Welcome to FinWise AI!**\n\nI'm here to help you with:\n\n- 💰 Budget Planning\n- 📈 SIP & Investment Advice\n- 💳 EMI Management\n- 🎯 Savings Goals\n- 💡 Personal Finance Tips\n\nAsk me anything!",
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, loading]);

  const quickAsk = (text) => {
    setMessage(text);

    setTimeout(() => {
      document.querySelector(".chat-input input")?.focus();
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      return;
    }

    const userMessage = {
      sender: "user",
      text: message,
    };

    setChat((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            userId: user._id,
            chatId,
          }),
        }
      );

      const data = await res.json();

      if(!chatId) {
        setChatId(data.chatId);
      }

      if (res.ok) {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
          },
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "❌ " + (data.message || "Unable to get response."),
          },
        ]);
      }
    } catch (error) {
      console.error(error);

      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Something went wrong while contacting FinWise AI.",
        },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div className="ai-container">
      <h2>🤖 FinWise AI Assistant</h2>

      <div className="chat-box">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === "user"
                ? "user-message"
                : "ai-message"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="avatar">
                🤖
              </div>
            )}

            <div className="bubble">
              {msg.sender === "ai" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai-message">
            <div className="avatar">🤖</div>

            <div className="bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      <div className="quick-prompts">
        <button
          onClick={() =>
            quickAsk("How can I save more money?")
          }
        >
          💰 Save Money
        </button>

        <button
          onClick={() =>
            quickAsk("Suggest a SIP plan")
          }
        >
          📈 SIP Advice
        </button>

        <button
          onClick={() =>
            quickAsk("Create a monthly budget")
          }
        >
          📊 Budget
        </button>
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask anything about finance..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;