import React, { useState } from "react";
import { encryptNoteWithPassword } from "../utils/crypto";

export default function EncryptionModal({ note, onClose, onUnlock, onUpdateNote }) {
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(note?.encrypted ? "unlock" : "lock");

  const doUnlock = async () => {
    try {
      await onUnlock(note.id, password);
      onClose();
    } catch {
      alert("Wrong password or decryption failed.");
    }
  };

  const doLock = async () => {
    if (!password) return alert("Provide password to lock");
    const enc = await encryptNoteWithPassword(note.content, password);

  
    await onUpdateNote(note.id, {
      content: JSON.stringify(enc),
      encrypted: true,
    });

    alert("Note encrypted.");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "unlock" ? "Unlock Note" : "Lock Note"}</h3>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="modal-actions">
          {mode === "unlock" ? (
            <button onClick={doUnlock}>Unlock</button>
          ) : (
            <button onClick={doLock}>Lock</button>
          )}
          <button onClick={() => setMode(mode === "unlock" ? "lock" : "unlock")}>
            Switch to {mode === "unlock" ? "Lock" : "Unlock"}
          </button>
          <button onClick={onClose} className="secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
