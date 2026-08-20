import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./AIAssistant.css";

function AIAssistant({ selectedChatId }) {
    const user = JSON.parse(localStorage.getItem("user"));

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);

    const chatEndRef = useRef(null);

    const welcomeMessage = {
        sender: "ai",
        text: `# 👋 Hello ${user?.name || "there"}!

I'm **FinWise AI**, your Smart Financial Assistant.

I can help you with:

- 💰 Budget Planning
- 📈 SIP Advice
- 💳 EMI Management
- 🎯 Savings Goals
- 💡 Personal Finance Tips

---

Ask me anything about your finances and I'll help you plan smarter.`,
    };

    const [messages, setMessages] = useState([welcomeMessage]);

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
        if (!message.trim() || loading) return;

        const userMessage = {
            sender: "user",
            text: message,
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        const currentMessage = message;
        setMessage("");

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/ai/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: currentMessage,
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
                            (data.message ||
                                "Unable to get response."),
                    },
                ]);
            }
        } catch (err) {
            console.log(err);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: "❌ Something went wrong. Please try again.",
                },
            ]);
        }

        setLoading(false);
    };

    const loadChat = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/ai/history/chat/${id}`
            );

            const data = await res.json();

            setMessages(data.messages);
            setChatId(data._id);

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (selectedChatId) {
            loadChat(selectedChatId);
        } else {
            setChatId(null);
            setMessages([welcomeMessage]);
        }
    }, [selectedChatId]);

    return (
        <div className="ai-container">

            {/* CHAT AREA */}
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
                                ✨
                            </div>
                        )}

                        <div className="bubble">

                            {msg.sender === "ai" ? (
                                <ReactMarkdown>
                                    {msg.text}
                                </ReactMarkdown>
                            ) : (
                                <p className="user-text">
                                    {msg.text}
                                </p>
                            )}

                        </div>

                    </div>
                ))}

                {/* TYPING INDICATOR */}
                {loading && (
                    <div className="message ai-message">

                        <div className="avatar">
                            ✨
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


            {/* QUICK PROMPTS */}
            <div className="quick-section">

                <div className="quick-prompts">

                    <button
                        onClick={() =>
                            quickAsk(
                                "How can I save more money?"
                            )
                        }
                    >
                        💰 Save Money
                    </button>

                    <button
                        onClick={() =>
                            quickAsk(
                                "Suggest a SIP plan"
                            )
                        }
                    >
                        📈 SIP Advice
                    </button>

                    <button
                        onClick={() =>
                            quickAsk(
                                "Create a monthly budget"
                            )
                        }
                    >
                        📊 Budget
                    </button>

                    <button
                        onClick={() =>
                            quickAsk(
                                "How can I reach my savings goal?"
                            )
                        }
                    >
                        🎯 Savings Goal
                    </button>

                </div>

            </div>


            {/* INPUT */}
            <div className="chat-input">

                <input
                    type="text"
                    placeholder="Ask FinWise AI about your finances..."
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
                    disabled={loading || !message.trim()}
                >
                    {loading ? (
                        <span className="send-loading">
                            ...
                        </span>
                    ) : (
                        <>
                            Send
                            <span className="send-arrow">
                                →
                            </span>
                        </>
                    )}
                </button>

            </div>

        </div>
    );
}

export default AIAssistant;