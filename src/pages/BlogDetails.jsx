import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Blogs.css";

function BlogDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);

    useEffect(() => {

        const blogs =
            JSON.parse(localStorage.getItem("blogs")) || [];

        const selectedBlog = blogs.find(
            (item) => item.id == id
        );

        setBlog(selectedBlog);

    }, [id]);

    if (!blog) {
        return (
            <div className="blogs-page">
                <h2>Blog not found.</h2>
            </div>
        );
    }

    return (

        <div className="blog-details-page">

            <button
                className="back-btn"
                onClick={() => navigate("/blogs")}
            >
                ← Back to Blogs
            </button>

            <div className="blog-details-content">

                <span className="category-badge">
                    {blog.category}
                </span>

                <h1>{blog.title}</h1>

                <div className="blog-meta">

                    <span>👤 {blog.author}</span>

                    <span>📅 {blog.publishDate}</span>

                    <span>⏱ {Math.ceil(blog.content.replace(/<[^>]+>/g, "").split(" ").length / 200)} min read</span>

                </div>

                <p className="blog-short-desc">
                    {blog.description}
                </p>

                <hr />
                 {blog.thumbnail && (

                    <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="blog-banner"
                    />

                )}

                <div
                    className="blog-rich-content"
                    dangerouslySetInnerHTML={{
                        __html: blog.content,
                    }}
                />

            </div>

        </div>

    );
}

export default BlogDetails;