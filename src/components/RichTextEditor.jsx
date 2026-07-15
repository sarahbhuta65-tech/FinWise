import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useEffect } from "react";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FaBold,
  FaItalic,
  FaUndo,
  FaRedo,
  FaListUl,
  FaListOl,
} from "react-icons/fa";
import Link from "@tiptap/extension-link";
import { FaLink } from "react-icons/fa";
import Underline from "@tiptap/extension-underline";
import { FaUnderline } from "react-icons/fa";
import TextAlign from "@tiptap/extension-text-align";
import {
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
} from "react-icons/fa";
import Image from "@tiptap/extension-image";
import { FaImage } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaGripLines } from "react-icons/fa";
import { FaQuoteRight } from "react-icons/fa";
import CodeBlock from "@tiptap/extension-code-block";


function RichTextEditor({ content, setContent}) {
    const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
   const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Image,
            Placeholder.configure({
                placeholder: "✍️ Start writing your blog here...",
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || "");
        }
    }, [editor, content]);

     return(
        <div className="editor-container">
            <div className="editor-toolbar">

                <button
                    className={editor.isActive("bold") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <FaBold />
                </button>

                <button
                    className={editor.isActive("italic") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <FaItalic />
                </button>

                <button
                    className={editor.isActive("underline") ? "active" : ""}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                >
                    <FaUnderline />
                </button>

                <div className="toolbar-divider"></div>

                <button
                    className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                >
                    H1
                </button>

                <button
                    className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    H2
                </button>

                <div className="toolbar-divider"></div>

                <button
                    className={editor.isActive("bulletList") ? "active" : ""}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <FaListUl />
                </button>

                <button
                    className={editor.isActive("orderedList") ? "active" : ""}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    <FaListOl />
                </button>

                <div className="toolbar-divider"></div>

                <button
                    disabled={!editor.can().chain().focus().undo().run()}
                    onClick={() =>
                        editor.chain().focus().undo().run()
                    }
                >
                    <FaUndo />
                </button>

                <button
                    disabled={!editor.can().chain().focus().redo().run()}
                    onClick={() =>
                        editor.chain().focus().redo().run()
                    }
                >
                    <FaRedo />
                    </button>

                    <div className="toolbar-divider"></div>
                    <button
                        className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    >
                        <FaAlignLeft />
                    </button>

                    <button
                        className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    >
                        <FaAlignCenter />
                    </button>

                    <button
                        className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    >
                        <FaAlignRight />
                    </button>
                    
                    <button
                    title="Insert Link"
                    onClick={()=>setShowLinkModal(true)}
                    >
                        <FaLink/>
                    </button>

                    <button
                    title="Insert Image"
                    onClick={()=>{
                        let url = window.prompt("Enter Image URL");

                        if(!url) return;

                        editor
                        .chain()
                        .focus()
                        .setImage({src:url})
                        .run();
                    }}
                    >
                        <FaImage/>
                    </button>

                    <button
                    title="Code Block"
                    onClick={()=>
                    editor.chain().focus().toggleCodeBlock().run()
                    }
                    >
                        <FaCode/>
                    </button>

                   <button
                    title="Quote"
                    className={editor.isActive("blockquote") ? "active" : ""}
                    onClick={()=>
                    editor.chain().focus().toggleBlockquote().run()
                    }
                    >
                        <FaQuoteRight/>
                    </button>

                    <button
                    title="Horizontal Line"
                    onClick={()=>
                    editor.chain().focus().setHorizontalRule().run()
                    }
                    >
                        <FaGripLines/>
                    </button>
                </div>



            <EditorContent editor={editor} />
            {
            showLinkModal && (
                <div className="modal-overlay">

                    <div className="link-modal">

                        <h3><FaLink/>Insert Link</h3>

                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e)=>setLinkUrl(e.target.value)}
                        />

                        <div className="modal-buttons">

                            <button
                                className="secondary-btn"
                                onClick={()=>{
                                    setShowLinkModal(false);
                                    setLinkUrl("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-btn"
                                onClick={()=>{

                                    let url = linkUrl;

                                    if(
                                        !url.startsWith("http://") &&
                                        !url.startsWith("https://")
                                    ){
                                        url = "https://" + url;
                                    }

                                    editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange("link")
                                        .setLink({href:url})
                                        .run();

                                    setShowLinkModal(false);
                                    setLinkUrl("");

                                }}
                            >
                                Insert
                            </button>

                        </div>

                    </div>

                </div>
            )
            }
        </div>
     );
}

export default RichTextEditor;