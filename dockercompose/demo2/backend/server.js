import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Database connection pool.
// In Docker Compose, "postgres" is the service name of the database container.
// So the backend should connect to host: "postgres", not "localhost".
const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "dan",
  password: process.env.DB_PASSWORD || "secret",
  database: process.env.DB_NAME || "restaurant"
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      category TEXT NOT NULL,
      allergens TEXT[] DEFAULT '{}'
    );
  `);

  const result = await pool.query("SELECT COUNT(*) FROM menu_items;");
  const count = Number(result.rows[0].count);

  if (count === 0) {
    await pool.query(`
      INSERT INTO menu_items (name, price, category, allergens)
      VALUES
        ('Salmon Sushi', 12.90, 'Main dish', ARRAY['fish']),
        ('Vegetarian Ramen', 10.50, 'Main dish', ARRAY['soy', 'gluten']),
        ('Green Tea', 3.00, 'Drink', ARRAY[]::TEXT[]);
    `);

    console.log("Seeded initial menu items.");
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Express backend with PostgreSQL is running inside Docker"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1;");

    res.json({
      status: "ok",
      backend: "running",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      backend: "running",
      database: "not connected",
      error: error.message
    });
  }
});

app.get("/api/menu", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, price, category, allergens
      FROM menu_items
      ORDER BY id;
    `);

    res.json({
      items: result.rows
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch menu items",
      details: error.message
    });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    const { name, price, category, allergens = [] } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        error: "name, price, and category are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO menu_items (name, price, category, allergens)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, price, category, allergens;
      `,
      [name, price, category, allergens]
    );

    res.status(201).json({
      item: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create menu item",
      details: error.message
    });
  }
});

// Start server only after database initialization.
// 0.0.0.0 allows Docker port mapping to forward requests into this container.
// On the host machine, open http://localhost:5000.
initializeDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });