import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import { encryptNoteWithPassword } from "../utils/crypto";
import { summarizeNote, suggestTagsFromText } from "../utils/ai";

export default function Editor({ note, onSave, onDelete, onUpdate, onRequestLock }) {
  const [content, setContent] = useState(note.content || "");
  const [locked, setLocked] = useState(note.encrypted || false);
  const [summary, setSummary] = useState(note.meta?.summary || "");
  const [tags, setTags] = useState(note.meta?.tags || []);

  useEffect(() => {
    setContent(note.content || "");
    setLocked(note.encrypted || false);
    setSummary(note.meta?.summary || "");
    setTags(note.meta?.tags || []);
  }, [note]);

  const handleSave = async () => {
    const summary = await summarizeNote(content);
    const tags = suggestTagsFromText(content);
    await onSave(note.id, content);
    onUpdate(note.id, { meta: { summary, tags } });
    setSummary(summary);
    setTags(tags);
  };

  const handleLock = async () => {
    const pwd = prompt("Enter password to lock:");
    if (!pwd) return;
    const encObj = await encryptNoteWithPassword(content, pwd);
    await onUpdate(note.id, { content: JSON.stringify(encObj), encrypted: true, meta: note.meta });
    setLocked(true);
    alert("Note locked. Unlock from list.");
  };

  const handleDelete = () => {
    if (window.confirm("Delete this note?")) onDelete(note.id);
  };

  if (locked) {
    return (
      <div className="locked-note">
        This note is password-protected. Unlock from the list to edit.
      </div>
    );
  }

  return (
    <div className="editor-wrapper">
      <div className="editor-header">
        <input
          className="title-input"
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
        />
        <div className="header-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleLock}>Lock 🔒</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </div>


      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            [{ font: [] }], // Arial, Times, etc.
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["link", "blockquote", "code-block"],
            ["clean"],
          ],
        }}
        formats={[
          "header", "font", "bold", "italic", "underline", "strike",
          "color", "background", "list", "bullet", "align",
          "link", "blockquote", "code-block"
        ]}
        className="editor"
      />

      <div className="meta">
        <div><strong>Summary:</strong> {summary || "—"}</div>
        <div><strong>Tags:</strong> {tags.join(", ") || "—"}</div>
      </div>
    </div>
  );
}
