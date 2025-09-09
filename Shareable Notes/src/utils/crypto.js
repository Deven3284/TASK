const enc = (s) => new TextEncoder().encode(s);
const dec = (b) => new TextDecoder().decode(b);
const toB64 = (arr) => btoa(String.fromCharCode(...new Uint8Array(arr)));
const fromB64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptNoteWithPassword(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc(plaintext));
  return { cipher: toB64(cipherBuffer), iv: toB64(iv), salt: toB64(salt) };
}

export async function decryptNoteWithPassword({ cipher, iv, salt }, password) {
  const saltArr = fromB64(salt);
  const ivArr = fromB64(iv);
  const key = await deriveKey(password, saltArr);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivArr }, key, fromB64(cipher));
  return dec(plainBuf);
}

export async function decryptNoteIfNeeded(note, password) {
  if (!note.encrypted) return note.content;
  try {
    const obj = typeof note.content === "string" ? JSON.parse(note.content) : note.content;
    return await decryptNoteWithPassword(obj, password);
  } catch {
    throw new Error("Decryption failed");
  }
}
