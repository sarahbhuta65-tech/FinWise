import { FiArrowLeft, FiPlus, FiMessageSquare } from "react-icons/fi";
//import "./HistoryPanel.css";

function HistoryPanel({
  history,
  onBack,
  onOpenChat,
  onNewChat,
}) {
    const loadHistory = async () => {
    try {
        const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/history/${user._id}`
        );

        const data = await res.json();

        console.log("History Data:", data); // 👈 Add this

        setHistory(data);
    } catch (err) {
        console.log(err);
    }
    };
  return (
    <div className="history-panel">

      <div className="history-header">

        <button
          className="back-btn"
          onClick={onBack}
        >
          <FiArrowLeft />
        </button>

        <h2>History</h2>

      </div>

      <button
        className="new-chat-btn"
        onClick={onNewChat}
      >
        <FiPlus />
        New Chat
      </button>

      <div className="history-list">

        {history.length === 0 ? (
          <div className="empty-history">

            <FiMessageSquare size={40} />

            <h3>No conversations yet</h3>

            <p>
              Start chatting with FinWise AI.
            </p>

          </div>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              className="history-card"
              onClick={() => onOpenChat(item._id)}
            >
              <h4>{item.title}</h4>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default HistoryPanel;