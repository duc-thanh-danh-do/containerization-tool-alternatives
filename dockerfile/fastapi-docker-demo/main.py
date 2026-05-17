from fastapi import FastAPI

app = FastAPI(
    title="FastAPI Docker Demo",
    description="A simple backend API for Docker practice",
    version="1.0.0"
)

menu_items = [
    {
        "id": 1,
        "name": "Salmon Sushi",
        "price": 12.90,
        "category": "Main dish",
        "allergens": ["fish"]
    },
    {
        "id": 2,
        "name": "Vegetarian Ramen",
        "price": 10.50,
        "category": "Main dish",
        "allergens": ["soy", "gluten"]
    },
    {
        "id": 3,
        "name": "Green Tea",
        "price": 3.00,
        "category": "Drink",
        "allergens": []
    }
]


@app.get("/")
def root():
    return {
        "message": "FastAPI backend is running inside Docker"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "fastapi-docker-demo"
    }


@app.get("/api/menu")
def get_menu():
    return {
        "items": menu_items
    }


@app.get("/api/menu/{item_id}")
def get_menu_item(item_id: int):
    for item in menu_items:
        if item["id"] == item_id:
            return item

    return {
        "error": "Menu item not found"
    }