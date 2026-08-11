# EcomSphere container deployment demo

This repository is a deployment-focused copy of the EcomSphere full-stack e-commerce application. It preserves the real React frontend, Spring Boot REST API, MongoDB persistence, JWT authentication, product, store, order, review, messaging, notification, upload, and payment code while providing safe mock defaults for optional external services.

> **Attribution:** This repository is a simplified deployment demonstration based on a group project. The original application was developed collaboratively by the project team. This repository focuses on demonstrating the containerization and deployment process and should not be interpreted as claiming individual authorship of the complete application.

The original MIT copyright notices remain in `frontend/LICENSE` and `backend/LICENSE`.

## Architecture and technologies

```text
Browser :5173
    |
    v
Frontend container (React 19 build served by Nginx)
    |  /api is reverse-proxied over the Compose network
    v
Backend container :8080 (Kotlin, Spring Boot 3.5, Java 21)
    |
    v
MongoDB container :27017 (internal network only)
```

The frontend and backend use separate multi-stage images. Vite produces static production assets, Nginx serves them and proxies API traffic, and the backend runs the Gradle-built JAR as a non-root user. Compose adds service discovery: Nginx reaches `backend:8080`, and Spring Boot reaches `database:27017`.

## Prerequisites

- Docker Engine/Desktop with Docker Compose v2
- About 2 GB free memory for the first build
- Internet access on the first build to download images and dependencies

Podman can use the same Dockerfiles. Replace `docker` with `podman`; for the full stack use `podman compose` if a Compose provider is installed.

## Environment variables

The stack runs with safe defaults. To inspect or override them:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string; defaults to the local `database` service. An Atlas URI can be supplied instead. |
| `JWT_SECRET` | Signs JWTs. Replace the walkthrough value before any real deployment. |
| `CLIENT_URI` | Browser origin allowed by backend CORS. |
| `EXTERNAL_API` | Optional external product API base URL. |
| `USE_MOCK_CLOUDINARY`, `USE_MOCK_STRIPE` | Keep uploads and payments credential-free for the demo. |
| Cloudinary, Stripe, mail variables | Optional real integration credentials; leave placeholders/blank in mock mode. |
| `VITE_API_BASE_URL` | Frontend build-time API path; `/api` uses the Nginx proxy. |
| `FRONTEND_PORT`, `BACKEND_PORT` | Host ports published by Compose. |

Never commit `.env`. Vite values are embedded during the frontend build, so only public values such as a Stripe publishable key belong there.

## Build the images manually

From the repository root:

```bash
docker build -t ecomsphere-backend ./backend
docker build -t ecomsphere-frontend ./frontend
docker images
```

The frontend defaults to `/api`. To choose a different public API URL at build time:

```bash
docker build -t ecomsphere-frontend \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  ./frontend
```

## Run the containers manually

Create a shared network and start MongoDB first:

```bash
docker network create ecomsphere-network
docker run -d --name database --network ecomsphere-network \
  -v ecomsphere-mongo-data:/data/db mongo:8.0
```

Copy `.env.example` to `.env`, then start the backend. The container names matter because they become DNS names on the shared network.

```bash
docker run -d --name backend --network ecomsphere-network \
  --env-file .env -p 8080:8080 ecomsphere-backend

docker run -d --name frontend --network ecomsphere-network \
  -p 5173:80 ecomsphere-frontend
```

The browser calls `http://localhost:5173/api/...`. Nginx removes the first `/api` prefix and forwards the request to `http://backend:8080/...` inside the container network. The browser never needs the backend container's private address.

## Run the complete stack with Compose

```bash
docker compose up --build
```

Use `docker compose up --build -d` for detached mode. Compose creates the network, starts MongoDB, waits for its health check, starts the backend, waits for backend readiness, and then starts the frontend.

## Verify the deployment

- Frontend: <http://localhost:5173>
- Backend health directly: <http://localhost:8080/health>
- Backend readiness (includes MongoDB): <http://localhost:8080/health/ready>
- Backend health through Nginx/container networking: <http://localhost:5173/api/health>
- Dependency status: <http://localhost:8080/health/deps>

The health response should contain `"status":"up"`, readiness should contain `"status":"ready"`, and the dependency response should report MongoDB as up and Cloudinary/Stripe in mock mode.

## Inspect and troubleshoot

```bash
docker ps
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker logs backend
docker exec -it backend sh
docker images
```

If the UI returns `502 Bad Gateway`, wait for Spring Boot to finish starting and check `docker compose logs backend`. If MongoDB is unavailable, check `docker compose ps` and `docker compose logs database`. If host ports are busy, change `FRONTEND_PORT` or `BACKEND_PORT` in `.env`.

## Stop and clean up

```bash
docker compose down
```

To also delete the walkthrough database volume:

```bash
docker compose down -v
```

For manually created containers and network:

```bash
docker rm -f frontend backend database
docker network rm ecomsphere-network
docker volume rm ecomsphere-mongo-data
```
