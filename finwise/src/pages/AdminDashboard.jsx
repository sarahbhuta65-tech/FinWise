import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import ManageBlogs from "./ManageBlogs";
import ManageFAQs from "./ManageFAQs";
import CreateBlog from "./CreateBlog";
import CreateFAQs from "./CreateFAQs";
import "./Admin.css";
import DashboardChart from "./DashboardChart";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard(){
    const [blogs, setBlogs] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedBlogs=
            JSON.parse(localStorage.getItem("blogs")) || [];

        const savedFaqs=
            JSON.parse(localStorage.getItem("faqs")) || [];

        setBlogs(savedBlogs);
        setFaqs(savedFaqs);
    }, []);

    const latestBlog = 
         blogs.length >0
           ? blogs[blogs.length - 1]
           : null;

    const latestFaq = 
         faqs.length > 0
             ? faqs[faqs.length - 1]
             :null;

    const publishedBlogs = blogs.filter(
    blog => blog.status === "Published"
    ).length;

    const draftBlogs = blogs.filter(
        blog => blog.status === "Draft"
    ).length;

    const publishedFaqs = faqs.filter(
        faq => faq.status === "Published"
    ).length;

    const draftFaqs = faqs.filter(
        faq => faq.status === "Draft"
    ).length;

    const totalPublished = publishedBlogs + publishedFaqs;
    const totalDrafts = draftBlogs + draftFaqs;


    return(
        <div className="admin-layout">
            <AdminSidebar />

            <div className="admin-main">
                <AdminTopbar />
                
                <div className="dashboard-content">
                    
                    <div className="admin-cards">

                        <div className="admin-card">
                            <h3>📚 Blogs</h3>
                            <h1>{blogs.length}</h1>
                            <p>Total Blogs</p>
                        </div>

                        <div className="admin-card">
                            <h3>❓ FAQs</h3>
                            <h1>{faqs.length}</h1>
                            <p>Total FAQs</p>
                        </div>

                        <div className="admin-card">
                            <h3>🟢 Published</h3>
                            <h1>{totalPublished}</h1>
                            <p>Total Published</p>
                        </div>

                        <div className="admin-card">
                            <h3>🟡 Drafts</h3>
                            <h1>{totalDrafts}</h1>
                            <p>Total Drafts</p>
                        </div>

                    </div>

                    <div className="activity-card">
                        <h2>Recent Activity</h2>

                        {latestBlog && (
                            <div
                                className="activity-item"
                                onClick={() => navigate("/admin/blogs")}
                            >
                                <div className="activity-icon">
                                    📝
                                </div>

                                <div className="activity-content">
                                    <h4>Latest Blog</h4>
                                    <p>{latestBlog.title}</p>
                                    <span>{latestBlog.publishDate}</span>
                                </div>
                            </div>
                        )}

                        {latestFaq && (
                            <div
                                className="activity-item"
                                onClick={() => navigate("/admin/faqs")}
                            >
                                <div className="activity-icon">
                                    ❓
                                </div>

                                <div className="activity-content">
                                    <h4>Latest FAQ</h4>
                                    <p>{latestFaq.question}</p>
                                    <span>{latestFaq.publishDate}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DashboardChart
                        blogs={blogs}
                        faqs={faqs}
                    />

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>

                        <div className="action-buttons">
                            <button onClick={() => navigate("/admin/blogs/create")}>Add Blogs</button>
                            <button onClick={() => navigate("/admin/faqs/create")}>Add FAQs</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;