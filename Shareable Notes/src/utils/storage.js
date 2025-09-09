const KEY = "notes-v1";

export function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadNotes", e);
    return [];
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("saveNotes", e);
  }
}
