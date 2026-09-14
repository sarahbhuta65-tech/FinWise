import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./BlogDetails.css";
import axios from "axios";

function BlogDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);

    useEffect(() => {
        if (!id || id === "undefined") {
            return;
        }
        const fetchBlog = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/blogs/${id}`
                );
                setBlog(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBlog();
    }, [id]);


    if (!blog) {
        return (
            <div className="ledger-page">
                <div className="ledger-notfound">
                    <span className="ledger-notfound-code">404 / NOT FOUND</span>
                    <h2>This entry doesn't exist in the ledger.</h2>
                    <button className="ledger-back-btn" onClick={() => navigate("/blogs")}>
                        ← Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    const readMins = Math.ceil(
        blog.content.replace(/<[^>]+>/g, "").split(" ").length / 200
    );

    return (

        <div className="ledger-page">

            <div className="ledger-details">

                <button
                    className="ledger-back-btn"
                    onClick={() => navigate("/blogs")}
                >
                    ← Back to Blogs
                </button>

                <article className="ledger-entry">

                    {/* ENTRY HEADER */}
                    <header className="ledger-entry-header">

                        <div className="ledger-entry-top">
                            <span className="ledger-category-stamp">
                                {blog.category}
                            </span>
                            <span className="ledger-entry-id">
                                ENTRY №{(blog._id || blog.id || "").toString().slice(-6).toUpperCase() || "000000"}
                            </span>
                        </div>

                        <h1>{blog.title}</h1>

                        <p className="ledger-short-desc">
                            {blog.description}
                        </p>

                        <div className="ledger-meta-row">
                            <span className="ledger-meta-item">
                                <span className="ledger-meta-label">AUTHOR</span>
                                {blog.author}
                            </span>
                            <span className="ledger-meta-divider" />
                            <span className="ledger-meta-item">
                                <span className="ledger-meta-label">DATE</span>
                                {blog.publishDate}
                            </span>
                            <span className="ledger-meta-divider" />
                            <span className="ledger-meta-item">
                                <span className="ledger-meta-label">READ</span>
                                {readMins} min
                            </span>
                        </div>

                    </header>

                    <div className="ledger-tear-line" />

                    {blog.thumbnail && (
                        <figure className="ledger-banner-wrap">
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="ledger-banner"
                            />
                        </figure>
                    )}

                    <div
                        className="ledger-rich-content"
                        dangerouslySetInnerHTML={{
                            __html: blog.content,
                        }}
                    />

                </article>

            </div>

        </div>

    );
}

export default BlogDetails;