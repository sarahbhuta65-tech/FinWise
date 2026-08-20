import { useEffect, useState } from "react";
import "./MyAccount.css";
import toast from "react-hot-toast";

function Language() {
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const saved = localStorage.getItem("language");

    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("language", language);
    toast.success("Language preferences saved!");
  };

  return (
    <div className="language-page">

      {/* Header */}
      <div className="language-header">
        <div>
          <span className="language-eyebrow">
            PERSONALIZE YOUR EXPERIENCE
          </span>

          <h2>Language</h2>

          <p>
            Select your preferred language for your FinWise experience.
          </p>
        </div>

        <div className="language-icon">
          🌐
        </div>
      </div>

      <div className="language-divider" />

      {/* Current Language */}
      <div className="language-banner">
        <div className="language-status-icon">
          {language === "English"
            ? "🇬🇧"
            : language === "Hindi"
            ? "🇮🇳"
            : "🇮🇳"}
        </div>

        <div>
          <strong>
            {language} is currently selected
          </strong>

          <span>
            Your language preference will be saved for your next visit.
          </span>
        </div>
      </div>

      {/* Language Selection */}
      <div className="language-section">

        <span className="language-label">
          SELECT LANGUAGE
        </span>

        <div className="language-list">

          {/* English */}
          <button
            className={`language-option ${
              language === "English" ? "selected" : ""
            }`}
            onClick={() => setLanguage("English")}
          >
            <div className="language-option-left">
              <div className="language-flag">
                🇬🇧
              </div>

              <div>
                <strong>English</strong>
                <span>English (United Kingdom)</span>
              </div>
            </div>

            <div className="language-radio">
              {language === "English" && "✓"}
            </div>
          </button>

          {/* Hindi */}
          <button
            className={`language-option ${
              language === "Hindi" ? "selected" : ""
            }`}
            onClick={() => setLanguage("Hindi")}
          >
            <div className="language-option-left">
              <div className="language-flag">
                🇮🇳
              </div>

              <div>
                <strong>हिन्दी</strong>
                <span>Hindi</span>
              </div>
            </div>

            <div className="language-radio">
              {language === "Hindi" && "✓"}
            </div>
          </button>

          {/* Gujarati */}
          <button
            className={`language-option ${
              language === "Gujarati" ? "selected" : ""
            }`}
            onClick={() => setLanguage("Gujarati")}
          >
            <div className="language-option-left">
              <div className="language-flag">
                🇮🇳
              </div>

              <div>
                <strong>ગુજરાતી</strong>
                <span>Gujarati</span>
              </div>
            </div>

            <div className="language-radio">
              {language === "Gujarati" && "✓"}
            </div>
          </button>

        </div>
      </div>

      {/* Save */}
      <button
        className="language-save-btn"
        onClick={handleSave}
      >
        Save Language
        <span>→</span>
      </button>

      <div className="language-note">
        <span>🌐</span>

        <p>
          Your language preference is stored locally on this device.
        </p>
      </div>

    </div>
  );
}

export default Language;