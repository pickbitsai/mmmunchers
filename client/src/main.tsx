import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPickBits } from "./lib/pickbits";

initPickBits();
createRoot(document.getElementById("root")!).render(<App />);
