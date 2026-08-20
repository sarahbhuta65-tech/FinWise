import "./MyAccount.css";

function Appearance({ darkMode, setDarkMode }) {
  return (
    <div className="appearance-page">

      {/* Header */}
      <div className="appearance-header">
        <div>
          <span className="appearance-eyebrow">
            PERSONALIZE YOUR EXPERIENCE
          </span>

          <h2>Appearance</h2>

          <p>
            Choose the visual style that feels right for your FinWise
            experience.
          </p>
        </div>

        <div className="appearance-icon">
          {darkMode ? "🌙" : "☀️"}
        </div>
      </div>

      <div className="appearance-divider" />

      {/* Current Theme */}
      <div className="current-theme-banner">
        <div className="theme-status-icon">
          {darkMode ? "🌙" : "☀️"}
        </div>

        <div>
          <strong>
            {darkMode ? "Dark mode is active" : "Light mode is active"}
          </strong>

          <span>
            {darkMode
              ? "FinWise is using a darker interface for comfortable viewing."
              : "FinWise is using a clean and bright interface."}
          </span>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="appearance-section">

        <span className="appearance-label">
          SELECT THEME
        </span>

        <div className="theme-selection">

          {/* Light */}
          <button
            className={`theme-option ${!darkMode ? "selected" : ""}`}
            onClick={() => setDarkMode(false)}
          >
            <div className="theme-preview light-preview">
              <div className="preview-top">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="preview-content">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>

            <div className="theme-option-info">
              <div>
                <strong>☀️ Light Mode</strong>
                <span>Clean & bright</span>
              </div>

              <div className="theme-radio">
                {!darkMode && "✓"}
              </div>
            </div>
          </button>

          {/* Dark */}
          <button
            className={`theme-option ${darkMode ? "selected" : ""}`}
            onClick={() => setDarkMode(true)}
          >
            <div className="theme-preview dark-preview">
              <div className="preview-top">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="preview-content">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>

            <div className="theme-option-info">
              <div>
                <strong>🌙 Dark Mode</strong>
                <span>Easy on the eyes</span>
              </div>

              <div className="theme-radio">
                {darkMode && "✓"}
              </div>
            </div>
          </button>

        </div>
      </div>

      {/* Footer note */}
      <div className="appearance-note">
        <span>✨</span>
        <p>
          Your appearance preference is applied across your FinWise
          experience.
        </p>
      </div>

    </div>
  );
}

export default Appearance;