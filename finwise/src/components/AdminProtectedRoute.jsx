import { Navigate } from "react-router-dom";

let adminSessionStarted = false;

function AdminProtectedRoute({ children }) {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        localStorage.removeItem("user");
    }

    if (sessionStorage.getItem("adminLoginHandoff") === "true") {
        sessionStorage.removeItem("adminLoginHandoff");
        adminSessionStarted = true;
    }

    if (!user || !adminSessionStarted) {
        return <Navigate to="/admin-login" replace />;
    }

    if (!user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminProtectedRoute;