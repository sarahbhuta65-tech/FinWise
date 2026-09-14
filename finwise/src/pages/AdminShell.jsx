import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "./Admin.css";

function AdminShell({ children, darkMode, setDarkMode }) {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <AdminTopbar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
                {children}
            </div>
        </div>
    );
}

export default AdminShell;
