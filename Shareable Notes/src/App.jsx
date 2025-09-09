import React from "react";
import NotesApp from "./pages/NotesApp";

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Shareable Notes 📝</h1>
        <p className="subtitle">Custom rich text editor • AI helpers • Encryption</p>
      </header>
      <NotesApp />
       <footer className="footer">Built by deven</footer> 
    </div>
  );
}
