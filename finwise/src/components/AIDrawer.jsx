import { useEffect, useState } from "react";
import AIAssistant from "../pages/AIAssistant";
import HistoryPanel from "./HistoryPanel";
import "./AIDrawer.css";

function AIDrawer({ open, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const loadHistory = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/history/${user._id}`
      );

      const data = await res.json();

      setHistory(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const handleNewChat = () => {
    setSelectedChatId(null);
    setShowHistory(false);
  };

  const handleOpenChat = (id) => {
    setSelectedChatId(id);
    setShowHistory(false);
  };

  return (
    <>
      <div
        className={`drawer-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <div className={`ai-drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">

            <div className="title-left">
              <span className="ai-logo">✨</span>

              <div>
                <h2>FinWise AI</h2>
                <span>Smart Finance Assistant</span>
              </div>
            </div>

            <div className="title-actions">

              {!showHistory && (
                <button
                  className="history-btn"
                  onClick={() => setShowHistory(true)}
                >
                  🕘
                </button>
              )}

              <button
                className="close-btn"
                onClick={onClose}
              >
                ✕
              </button>

            </div>

          </div>
        </div>

        <div className="drawer-content">

          {showHistory ? (
            <HistoryPanel
              history={history}
              onBack={() => setShowHistory(false)}
              onOpenChat={handleOpenChat}
              onNewChat={handleNewChat}
            />
          ) : (
            <AIAssistant
              selectedChatId={selectedChatId}
            />
          )}

        </div>

      </div>
    </>
  );
}

export default AIDrawer;