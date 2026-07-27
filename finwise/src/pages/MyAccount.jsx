import { useState } from "react";
import AccountHeader from "../components/AccountHeader";
import AccountSidebar from "../components/AccountSidebar";
import PersonalInfo from "../components/PersonalInfo";
import ProfileStats from "../components/ProfileStats";
import Appearance from "../components/Appearnace";
import Notifications from "../components/Notifications";
import Security from "../components/Security";
import Activity from "../components/Activity";
import About from "../components/About";
import Logout from "../components/Logout";
import Language from "../components/Language";
import "../components/MyAccount.css";

function MyAccount({ darkMode, setDarkMode }) {
    const [activeSection, setActiveSection] = useState("personal");

    return(
        <div className="account-page">
            <AccountHeader />
            <ProfileStats/>

            <div className="account-body">

                <AccountSidebar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                />

                <div className="account-content">

                    {activeSection == "personal" && <PersonalInfo/>}

                    {activeSection === "security" && (<Security/>)}

                    {activeSection === "appearance" && (
                        <Appearance
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                        />
                    )}

                    {activeSection === "language" && (<Language />)}

                    {activeSection === "notifications" && <Notifications />}

                    {activeSection === "activity" && (
                        <Activity/>
                    )}

                    {activeSection === "about" && <About />}
                    {activeSection === "logout" && (
                        <Logout />
                    )}
                </div>  
            </div>

        </div>
    );
}

export default MyAccount;
