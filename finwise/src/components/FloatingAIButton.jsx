import { BsStars } from "react-icons/bs";
import "./FloatingAIButton.css";

function FloatingAIButton({ onClick }) {
  return (
    <button className="floating-ai" onClick={onClick}>
      <BsStars className="floating-ai-icon" />

      <span className="floating-ai-text">
        FinWise AI
      </span>

      <div className="floating-tooltip">
        👋 Hi Sarah!

        <br />
        I'm FinWise AI.

        <br/>

        Let's grow your money smarter.

        <br />

        Click to chat →
      </div>
    </button>
  );
}

export default FloatingAIButton;