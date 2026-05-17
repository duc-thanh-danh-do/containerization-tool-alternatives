import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  return (
    <main className="page">
      <section className="card">
        <p className="label">Docker Practice</p>

        <h1>React Multi-stage Build</h1>

        <p>
          This React app was built in a Node container and served by nginx in a
          smaller production container.
        </p>

        <div className="info">
          <p><strong>Stage 1:</strong> Node builds the React app.</p>
          <p><strong>Stage 2:</strong> nginx serves the static files.</p>
        </div>

        <button onClick={() => alert("Dockerized React app is working!")}>
          Test Button
        </button>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);