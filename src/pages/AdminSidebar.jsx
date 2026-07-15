import { Link, useNavigate } from "react-router-dom";
import {
    MdDashboard,
    MdArticle,
    MdQuestionAnswer,
    MdLogout,
} from "react-icons/md";
import ManageBlogs from "./ManageBlogs";
import ManageFAQs from "./ManageFAQs";

function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="admin-sidebar">

            <div className="admin-logo">
                <h2>🛡 FinWise CMS</h2>
                <span>Content Management</span>
            </div>

            <nav className="admin-menu">

                <Link to="/admin-dashboard" className="menu-item">
                    <MdDashboard />
                    <span>Dashboard</span>
                </Link>

                <Link to="/admin/blogs" className="menu-item">
                    <MdArticle />
                    <span>Manage Blogs</span>
                </Link>

                <Link to="/admin/faqs" className="menu-item">
                    <MdQuestionAnswer />
                    <span>Manage FAQs</span>
                </Link>
            </nav>

            <button className="logout-admin" onClick={handleLogout}>
                <MdLogout />
            </button>
        </div>
    );
}

export default AdminSidebar;

