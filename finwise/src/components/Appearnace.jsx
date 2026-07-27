import "./MyAccount.css";

function Appearance({ darkMode, setDarkMode }) {
    return (
        <div className="settings-card">

            <h2>🎨 Appearance</h2>

            <p>
                Choose how FinWise looks.
            </p>

            <div className="theme-options">

                <button
                    className={!darkMode ? "theme-btn active" : "theme-btn"}
                    onClick={() => setDarkMode(false)}
                >
                    ☀ Light Mode
                </button>

                <button
                    className={darkMode ? "theme-btn active" : "theme-btn"}
                    onClick={() => setDarkMode(true)}
                >
                    🌙 Dark Mode
                </button>

            </div>

        </div>
    );
}

export default Appearance;