import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./AIAssistant.css";

function AIAssistant({ selectedChatId }) {
    // Get logged-in user safely
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [remainingRequests, setRemainingRequests] = useState(null);
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

    // Auto-scroll to latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    // Quick prompt
    const quickAsk = (text) => {
        setMessage(text);

        setTimeout(() => {
            document.querySelector(".chat-input input")?.focus();
        }, 100);
    };

    // Send message
    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        if (!user?._id) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: "❌ User information not found. Please log in again.",
                },
            ]);
            return;
        }

        const currentMessage = message.trim();

        const userMessage = {
            sender: "user",
            text: currentMessage,
        };

        // Add user's message immediately
        setMessages((prev) => [...prev, userMessage]);

        setMessage("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please login again.");
            }

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/ai/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        message: currentMessage,
                        chatId: chatId,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {

                if (data.limitReached) {

                    setMessages((prev) => [
                        ...prev,
                        {
                            sender: "ai",
                            text: `🔒 ${data.message}`,
                        },
                    ]);

                    return;
                }

                throw new Error(
                    data.message || "Unable to get response."
                );
            }

            // Save chat ID after first message
            if (!chatId && data.chatId) {
                setChatId(data.chatId);
            }

            if (!data.isPremium) {
                setRemainingRequests(data.remaining);
            } else {
                setRemainingRequests(null);
            }

            // Add AI response
            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: data.reply || "Sorry, I couldn't generate a response.",
                },
            ]);
        } catch (err) {
            console.error("AI Chat Error:", err);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text:
                        "❌ Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Load selected chat
    const loadChat = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/ai/history/chat/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to load chat."
                );
            }

            setMessages(data.messages || []);
            setChatId(data._id || id);
        } catch (err) {
            console.error("Load Chat Error:", err);

            setMessages([
                {
                    sender: "ai",
                    text: "❌ Unable to load this conversation.",
                },
            ]);
        }
    };

    // Handle chat selection
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

                        {/* AI Avatar */}
                        {msg.sender === "ai" && (
                            <div className="avatar">
                                ✨
                            </div>
                        )}

                        {/* Message Bubble */}
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

            {remainingRequests !== null && (
                <div className="ai-usage">
                    <span>
                        Free AI requests remaining this month:
                    </span>

                    <strong>
                        {remainingRequests}/3
                    </strong>
                </div>
            )}

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
                    disabled={
                        remainingRequests === 0
                    }
                    placeholder={
                        remainingRequests === 0
                            ? "Free AI limit reached. Upgrade to Premium."
                            : "Ask FinWise AI about your finances..."
                    }
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />

                <button
                    onClick={sendMessage}
                    disabled={
                        loading ||
                        !message.trim() ||
                        remainingRequests === 0
                    }
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