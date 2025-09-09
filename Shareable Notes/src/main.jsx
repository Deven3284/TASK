import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "react-quill/dist/quill.snow.css";
import "./index.css";   

createRoot(document.getElementById("root")).render(<App />);
