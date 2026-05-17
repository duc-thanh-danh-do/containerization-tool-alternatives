import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [health, setHealth] = useState(null);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

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

  async function addDemoItem() {
    try {
      await fetch("http://localhost:5000/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Miso Soup",
          price: 4.5,
          category: "Starter",
          allergens: ["soy"]
        })
      });

      await loadData();
    } catch (err) {
      setError("Could not add new menu item.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <p className="label">Docker Compose Demo 2</p>

        <h1>React + Express + PostgreSQL</h1>

        <p>
          This demo runs three containers: frontend, backend, and PostgreSQL
          database.
        </p>

        <div className="statusBox">
          <h2>System Health</h2>

          {error && <p className="error">{error}</p>}

          {health ? (
            <ul>
              <li>Backend: {health.backend}</li>
              <li>Database: {health.database}</li>
              <li>Status: {health.status}</li>
            </ul>
          ) : (
            !error && <p>Loading system status...</p>
          )}
        </div>

        <div className="actions">
          <button onClick={loadData}>Refresh</button>
          <button onClick={addDemoItem}>Add demo item</button>
        </div>

        <div className="menuBox">
          <h2>Menu Items from PostgreSQL</h2>

          {menu.map((item) => (
            <article className="menuItem" key={item.id}>
              <h3>{item.name}</h3>
              <p>Category: {item.category}</p>
              <p>Price: €{item.price}</p>
              <p>
                Allergens:{" "}
                {item.allergens && item.allergens.length > 0
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