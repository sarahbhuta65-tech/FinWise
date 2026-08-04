import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./AIAssistant.css";

function AIAssistant({ selectedChatId }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatId, setChatId] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `# 👋 Hello ${user?.name || "there"}!

I'm **FinWise AI**

Your Smart Financial Assistant.

I can help you with:

- 💰 Budget Planning
- 📈 SIP Advice
- 💳 EMI Management
- 🎯 Savings Goals
- 💡 Personal Finance Tips

---

Ask me anything below 👇`,
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const quickAsk = (text) => {
    setMessage(text);

    setTimeout(() => {
      document.querySelector(".chat-input input")?.focus();
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

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

      if (!chatId && data.chatId) {
        setChatId(data.chatId);
      }

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text:
              "❌ " +
              (data.message || "Unable to get response."),
          },
        ]);
      }
    } catch (err) {
      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Something went wrong.",
        },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  const loadChat = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/history/chat/${id}`
      );

      const data = await res.json();

      setMessages(data.messages);

      setChat(data._id);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      loadChat(selectedChatId);
    } else {
      setChatId(null);

      setMessages([
        {
          sender: "ai",
          text: `# 👋 Hello ${user?.name || "there"}!

  I'm **FinWise AI**

  Your Smart Financial Assistant.

  Ask me anything about:

  - 💰 Budget Planning
  - 📈 SIP Advice
  - 💳 EMI Management
  - 🎯 Savings Goals
  - 💡 Personal Finance Tips

  ---

  Ask me anything below 👇`,
        },
      ]);
    }
  }, [selectedChatId]);

    return (
    <div className="ai-container">

      <div className="chat-box">

        {messages.map((msg, index) => (
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
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>

          </div>
        ))}

        {loading && (
          <div className="message ai-message">

            <div className="avatar">
              🤖
            </div>

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
          onChange={(e) =>
            setMessage(e.target.value)
          }
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