import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const menuItems = [
  {
    id: 1,
    name: "Salmon Sushi",
    price: 12.9,
    category: "Main dish",
    allergens: ["fish"]
  },
  {
    id: 2,
    name: "Vegetarian Ramen",
    price: 10.5,
    category: "Main dish",
    allergens: ["soy", "gluten"]
  },
  {
    id: 3,
    name: "Green Tea",
    price: 3.0,
    category: "Drink",
    allergens: []
  }
];

app.get("/", (req, res) => {
  res.json({
    message: "Express backend is running inside Docker"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "express-backend-demo"
  });
});

app.get("/api/menu", (req, res) => {
  res.json({
    items: menuItems
  });
});

// Start the Express server.
// In Docker, the app runs inside its own container network.
// If we listen only on "127.0.0.1", the app may only be reachable
// from inside the container itself.
//
// "0.0.0.0" means:
// listen on all network interfaces inside the container.
//
// This allows Docker port mapping, for example "5000:5000",
// to forward requests from the host machine to this backend.
//
// Important:
// Users should still open the app from the host machine with:
// http://localhost:5000
//
// "0.0.0.0" is for listening, not for opening in the browser.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend is listening on port ${PORT}`);
});
