import React from "react";

export default function NoteItem({ note, onSelect, onDelete, onPin, onLock, active }) {
  const title = note.title || "Untitled";
  const summary = note.meta?.summary || "";
  return (
    <div className={`note-item ${active ? "active" : ""}`} onClick={onSelect}>
      <div className="note-top">
        <div className="note-title">
          {note.pinned && <span className="pin">📌</span>}
          {title}
          {note.encrypted && <span className="lock-ind"> 🔒</span>}
        </div>
        <div className="note-actions">
          <button onClick={(e) => { e.stopPropagation(); onPin(); }}>{note.pinned ? "Unpin" : "Pin"}</button>
          <button onClick={(e) => { e.stopPropagation(); onLock(); }}>Lock</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Del</button>
        </div>
      </div>
      <div className="note-summary">{summary ? summary : stripHtml(note.content || "").slice(0, 80)}</div>
      <div className="note-meta">
        <small>{new Date(note.updatedAt).toLocaleString()}</small>
      </div>
    </div>
  );
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "");
}
