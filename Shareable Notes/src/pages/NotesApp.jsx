import React, { useEffect, useState } from "react";
import Toolbar from "../components/Toolbar";
import Editor from "../components/Editor";
import NotesList from "../components/NotesList";
import EncryptionModal from "../components/EncryptionModal";
import { loadNotes, saveNotes } from "../utils/storage";
import { summarizeNote, suggestTagsFromText } from "../utils/ai";
import { decryptNoteIfNeeded } from "../utils/crypto";

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState(null); 
  const [query, setQuery] = useState("");
  const [passModal, setPassModal] = useState(null); 

  // load notes from localStorage
  useEffect(() => {
    const saved = loadNotes();
    setNotes(saved);
  }, []);

 
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNew = () => {
    const note = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "<p></p>",
      pinned: false,
      encrypted: false,
      meta: { summary: "", tags: [] },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([note, ...notes]);
    setActive(note.id);
  };

  const updateNote = (id, patch) => {
    setNotes((cur) =>
      cur.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  };

  const saveFromEditor = async (id, content) => {
    const summary = await summarizeNote(content);
    const tags = suggestTagsFromText(content);
    updateNote(id, { content, meta: { summary, tags } });
  };

  const removeNote = (id) => {
    setNotes((cur) => cur.filter((n) => n.id !== id));
    if (active === id) setActive(null);
  };

  const togglePin = (id) => {
    const n = notes.find((x) => x.id === id);
    if (n) updateNote(id, { pinned: !n.pinned });
  };

  const lockNote = (id) => setPassModal({ noteId: id });

  const unlockNote = async (id, password) => {
    try {
      const n = notes.find((x) => x.id === id);
      const plaintext = await decryptNoteIfNeeded(n, password);
      updateNote(id, { content: plaintext, encrypted: false });
      setPassModal(null);
      setActive(id);
    } catch {
      alert("Decryption failed. Wrong password?");
    }
  };

 
  const getSearchableContent = (note) => {
    if (!note.encrypted) return note.content || "";
    try {
      return JSON.stringify(note.content); 
    } catch {
      return "";
    }
  };

  const searchResults = notes
    .filter((n) =>
      (n.title + " " + getSearchableContent(n))
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  return (
    <div className="notes-app">
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="create-btn" onClick={createNew}>
            + New Note
          </button>
          <input
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <NotesList
          notes={searchResults}
          onSelect={(id) => setActive(id)}
          onDelete={removeNote}
          onPin={togglePin}
          onLock={lockNote}
          activeId={active}
        />
      </aside>

      <main className="main-editor">
        <Toolbar />
        {active ? (
          <Editor
            key={active}
            note={notes.find((n) => n.id === active)}
            onSave={saveFromEditor}
            onDelete={() => removeNote(active)}
            onUpdate={updateNote}
            onRequestLock={(id) => lockNote(id)}
          />
        ) : (
          <div className="empty-state">
            Select or create a note to get started.
          </div>
        )}
      </main>

      {passModal && (
        <EncryptionModal
          note={notes.find((n) => n.id === passModal.noteId)}
          onClose={() => setPassModal(null)}
          onUnlock={unlockNote}
          onUpdateNote={updateNote}
        />
      )}
    </div>
  );
}
