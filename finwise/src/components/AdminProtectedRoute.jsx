import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        localStorage.removeItem("user");
    }

    const hasAdminSession =
        localStorage.getItem("adminLoggedIn") === "true" &&
        Boolean(localStorage.getItem("token"));

    if (!user || !hasAdminSession) {
        return <Navigate to="/admin-login" replace />;
    }

    if (!user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminProtectedRoute;