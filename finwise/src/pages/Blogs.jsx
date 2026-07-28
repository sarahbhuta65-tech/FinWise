import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Blogs.css";
import axios from "axios";

function Blogs() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/blogs`
                );
                setBlogs(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBlogs();
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

                    {blogs.map((blog) => {
                        const blogId = blog._id || blog.id;

                        return (
                            <div
                                className="blog-preview-card"
                                key={blogId || blog._id}
                                onClick={() => {
                                    if (!blogId || blogId === "undefined") {
                                        console.error("Blog missing or invalid ID:", blog);
                                        return;
                                    }
                                    navigate(`/blog/${blogId}`);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === "Enter" || e.key === " ") && blogId) {
                                        e.preventDefault();
                                        navigate(`/blog/${blogId}`);
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
                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default Blogs;