import React from "react";
import NoteItem from "./NoteItem";

export default function NotesList({ notes, onSelect, onDelete, onPin, onLock, activeId }) {
  return (
    <div className="notes-list">
      {notes.length === 0 && <div className="no-notes">No notes yet — create one.</div>}
      {notes.map((n) => (
        <NoteItem
          key={n.id}
          note={n}
          onSelect={() => onSelect(n.id)}
          onDelete={() => onDelete(n.id)}
          onPin={() => onPin(n.id)}
          onLock={() => onLock(n.id)}
          active={activeId === n.id}
        />
      ))}
    </div>
  );
}
