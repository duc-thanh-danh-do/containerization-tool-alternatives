import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [health, setHealth] = useState(null);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const healthResponse = await fetch("http://localhost:5000/api/health");
        const healthData = await healthResponse.json();

        const menuResponse = await fetch("http://localhost:5000/api/menu");
        const menuData = await menuResponse.json();

        setHealth(healthData);
        setMenu(menuData.items);
      } catch (err) {
        setError("Could not connect to backend API.");
      }
    }

    loadData();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <p className="label">Docker Compose Practice</p>

        <h1>React Frontend + Express Backend</h1>

        <p>
          This frontend is served by nginx, and it fetches data from a Node.js
          Express backend.
        </p>

        <div className="statusBox">
          <h2>Backend Health</h2>

          {error && <p className="error">{error}</p>}

          {health ? (
            <p>
              Status: <strong>{health.status}</strong> / Service:{" "}
              <strong>{health.service}</strong>
            </p>
          ) : (
            !error && <p>Loading backend status...</p>
          )}
        </div>

        <div className="menuBox">
          <h2>Menu Items</h2>

          {menu.map((item) => (
            <article className="menuItem" key={item.id}>
              <h3>{item.name}</h3>
              <p>Category: {item.category}</p>
              <p>Price: €{item.price}</p>
              <p>
                Allergens:{" "}
                {item.allergens.length > 0
                  ? item.allergens.join(", ")
                  : "none"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);