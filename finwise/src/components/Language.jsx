import { useEffect, useState } from "react";
import "./MyAccount.css";
import toast from "react-hot-toast";

function Language() {

    const [language, setLanguage] = useState("English");

    useEffect(() => {

        const saved = localStorage.getItem("language");

        if(saved){
            setLanguage(saved);
        }

    }, []);

    const handleSave = () => {

        localStorage.setItem("language", language);

        toast.success("Language preferences saved!");

    };

    return (

        <div className="settings-card">

            <h2>🌐 Language</h2>

            <p>Select your preferred language.</p>

            <div className="language-options">

                <label>
                    <input
                        type="radio"
                        value="English"
                        checked={language==="English"}
                        onChange={(e)=>setLanguage(e.target.value)}
                    />
                    🇬🇧 English
                </label>

                <label>
                    <input
                        type="radio"
                        value="Hindi"
                        checked={language==="Hindi"}
                        onChange={(e)=>setLanguage(e.target.value)}
                    />
                    🇮🇳 Hindi
                </label>

                <label>
                    <input
                        type="radio"
                        value="Gujarati"
                        checked={language==="Gujarati"}
                        onChange={(e)=>setLanguage(e.target.value)}
                    />
                    🇮🇳 Gujarati
                </label>

            </div>

            <button
                className="save-btn"
                onClick={handleSave}
            >
                Save Changes
            </button>

        </div>

    );

}

export default Language;