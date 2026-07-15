import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Blogs.css";

function Blogs() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const savedBlogs =
            JSON.parse(localStorage.getItem("blogs")) || [];

        const publishedBlogs = savedBlogs.filter(
            (blog) => blog.status === "Published"
        );

        setBlogs(publishedBlogs);
    }, []);

    return (
        <div className="blogs-page">

            <div className="blogs-header">
                <h1>📚 Financial Blogs</h1>
                <p>
                    Learn investing, savings, budgeting and financial planning.
                </p>
            </div>

            {blogs.length === 0 ? (

                <div className="empty-state">
                    <h2>No blogs published yet.</h2>
                </div>

            ) : (

                <div className="blogs-grid">

                    {blogs.map((blog) => (

                        <div
                            className="blog-preview-card"
                            key={blog.id}
                            onClick={() => navigate(`/blog/${blog.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    navigate(`/blog/${blog.id}`);
                                }
                            }}
                        >

                            {blog.thumbnail && (
                                <img
                                    src={blog.thumbnail}
                                    alt={blog.title}
                                />
                            )}

                            <div className="blog-preview-content">

                                <span className="category-badge">
                                    {blog.category}
                                </span>

                                <h2>{blog.title}</h2>

                                <p>
                                    {blog.description.length > 120
                                        ? blog.description.substring(0, 120) + "..."
                                        : blog.description}
                                </p>

                                <div className="blog-meta">
                                    <span>👤 {blog.author}</span>
                                    <span>📅 {blog.publishDate}</span>
                                </div>

                            </div>
                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Blogs;