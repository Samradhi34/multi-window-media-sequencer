# Multi-Window Media Sequencer

A full-stack web application for managing and playing media content across multiple display screens. It lets you control what image or video plays on each screen, set up playlists per screen, and broadcast a single piece of media to all screens at once — all from one dashboard.

---

## Overview

The application is built for scenarios where you have multiple display screens (like in a store, airport, or lobby) and you want to manage what plays on each one. You can:

- See all screens live in a preview dashboard
- Build a playlist for each screen with images and videos
- Trigger a synchronized broadcast that overrides all screens with the same media at the same time
- Add or delete display windows dynamically
- Manage a shared media catalog that all windows can use

The frontend and backend communicate over REST API for actions (like adding media), and over WebSocket for real-time updates (like which media is currently playing and how much time is left).

---

## Key Features

- Live preview of all display windows with real-time playback status
- Playlist management per display window — add, remove, and reorder items
- Synchronized global broadcast — push one media item to all screens simultaneously
- Dynamic display window creation and deletion
- Shared media catalog supporting IMAGE, VIDEO, and BLANK media types
- URL format validation — prevents saving a video URL under an IMAGE type and vice versa
- Playback calculated from current time within a 5-hour rolling cycle (no database writes required for tracking which item is playing)
- Real-time updates via WebSocket (STOMP protocol) with HTTP polling as fallback
- Docker support for single-container production deployment
- Configured for deployment on Koyeb and Render

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.5.4 |
| ORM | Spring Data JPA, Hibernate |
| Database | PostgreSQL (local dev), H2 in-memory (Docker/cloud fallback) |
| WebSocket | Spring WebSocket, STOMP protocol |
| Validation | Jakarta Bean Validation |
| Utilities | Lombok, SLF4J logging |
| Frontend | React 19, Vite 8 |
| API Communication | Fetch API (REST) |
| Real-Time | Native WebSocket client (STOMP frames) |
| Containerization | Docker (multi-stage build) |
| Cloud Deployment | Koyeb, Render |

---

## Project Architecture

The backend follows a standard layered architecture:

```
Request
  └── Controller        (receives HTTP request, calls service)
        └── Service     (business logic)
              └── Repository  (database queries via Spring Data JPA)
                    └── Entity  (mapped to database table)
```

Supporting layers:
- **DTO** — objects used to transfer data between client and controller (request/response shapes)
- **Mapper** — converts between DTO and Entity
- **Exception** — custom exceptions and a global exception handler
- **Config** — CORS, WebSocket, SPA routing, data seeding
- **WebSocket Publisher** — scheduled component that broadcasts playback state every second

---

## Project Structure

```
multi-window-media-sequencer/
├── src/main/java/com/mediasquence/
│   ├── config/
│   │   ├── CorsConfig.java               # CORS settings for all origins
│   │   ├── DataInitializer.java          # Seeds default windows and media on startup
│   │   ├── JacksonConfig.java            # JSON serialization configuration
│   │   ├── WebMvcConfig.java             # Serves embedded React frontend + SPA routing fallback
│   │   └── WebSocketConfig.java          # STOMP WebSocket broker configuration
│   ├── constants/
│   │   └── MediaType.java                # Enum: IMAGE, VIDEO, BLANK
│   ├── controller/
│   │   ├── DisplayWindowController.java  # Window CRUD and playlist endpoints
│   │   ├── MediaItemController.java      # Media catalog endpoints
│   │   ├── RootController.java           # Health check endpoint
│   │   └── SyncController.java           # Sync trigger/cancel/status endpoints
│   ├── dto/
│   │   ├── request/                      # Incoming request bodies
│   │   └── response/                     # Outgoing response shapes
│   ├── entity/
│   │   ├── DisplayWindow.java            # Display screen record
│   │   ├── MediaItem.java                # Media asset record
│   │   ├── PlaylistItem.java             # Link between window and media (ordered)
│   │   └── SyncState.java                # Tracks active global sync state
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java   # Handles all exceptions uniformly
│   │   ├── ResourceNotFoundException.java
│   │   └── BaseRuntimeException.java
│   ├── mapper/
│   │   └── MediaMapper.java              # DTO ↔ Entity conversion
│   ├── repository/                        # Spring Data JPA interfaces
│   ├── service/
│   │   ├── implementation/               # Business logic implementations
│   │   └── websocket/
│   │       └── PlaybackWebSocketPublisher.java  # Broadcasts playback state every 1 second
│   └── MultiWindowMediaSequencerApplication.java
│
├── src/main/resources/
│   └── application.properties
│
├── frontend/
│   └── src/
│       ├── components/                   # All UI components
│       ├── services/
│       │   ├── api.js                    # REST API calls using Fetch
│       │   └── websocket.js              # WebSocket client (STOMP over raw WebSocket)
│       ├── App.jsx                        # Root component, state management
│       ├── main.jsx                       # React entry point
│       └── index.css                     # All application styles
│
├── Dockerfile                            # Multi-stage Docker build
├── docker-compose.yml                    # Local Docker orchestration
├── .dockerignore
├── koyeb.yaml                            # Koyeb deployment config
├── render.yaml                           # Render deployment config
└── pom.xml
```

---

## How the Application Works

### Playback Calculation

Each display window has a playlist. The application does not track "which item is currently playing" by writing to the database every second. Instead, it calculates the current playing item mathematically:

1. Get the current server time in seconds
2. Take that time modulo a 5-hour cycle (18,000 seconds)
3. Take the result modulo the total duration of the window's playlist
4. Walk through the playlist items to find which item falls at that offset

This means playback is stateless — no constant database writes, and it stays consistent across all requests.

### Global Sync

When you trigger a sync broadcast:
1. A `SyncState` record is saved with the selected media item, start time, and duration
2. Every window's playback calculation checks for an active sync first
3. If sync is active, it overrides the playlist and shows the synced media on all windows
4. When the duration expires (checked by comparing current time to start time + duration), sync ends automatically
5. Windows return to their individual playlists

---

## Database

### Tables

| Table | Purpose |
|---|---|
| `display_windows` | Each row is a display screen (name, description, created_at) |
| `media_items` | Each row is a media asset (title, type, URL, duration in seconds) |
| `playlist_items` | Links a media item to a window with a sequence order |
| `sync_state` | Stores the active sync broadcast record |

### Relationships

- A `DisplayWindow` has many `PlaylistItem` records
- Each `PlaylistItem` belongs to one `DisplayWindow` and one `MediaItem`
- `MediaItem` can appear in playlists of multiple windows

### Default Seed Data

On first startup, the application seeds 3 display windows (Window 1, Window 2, Window 3) and 8 media items (images and videos with public URLs) automatically via `DataInitializer`.

---

## API Reference

### Display Windows

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/windows` | Get all display windows |
| `POST` | `/api/windows` | Create a new display window |
| `DELETE` | `/api/windows/{id}` | Delete a display window |
| `GET` | `/api/windows/playback` | Get live playback status of all windows |
| `GET` | `/api/windows/{id}/playback` | Get live playback status of one window |
| `POST` | `/api/windows/{id}/media` | Add a media item to a window's playlist |
| `DELETE` | `/api/windows/{id}/media/{mediaId}` | Remove a media item from a window's playlist |
| `POST` | `/api/windows/{id}/media/{mediaId}/move` | Move a playlist item up or down |

### Media Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/media` | Get all media items |
| `POST` | `/api/media` | Create a new media item |
| `PUT` | `/api/media/{id}/duration` | Update playback duration of a media item |
| `DELETE` | `/api/media/{id}` | Delete a media item |

### Sync Broadcast

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sync` | Get current sync status |
| `POST` | `/api/sync/trigger` | Start a global sync broadcast |
| `POST` | `/api/sync/cancel` | Cancel the active sync broadcast |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check if the API is running |

### All API responses follow this format:

```json
{
  "status": 200,
  "message": "...",
  "data": { ... }
}
```

---

## WebSocket

### What it does in this project

The backend sends the live playback state (which media is playing on which window and how many seconds remain) to the frontend every 1 second via WebSocket. This is how the live preview cards and progress bars on the dashboard update in real time without the page needing to keep refreshing.

### How it works

**Backend (`PlaybackWebSocketPublisher.java`):**
- A scheduled task runs every 1,000 milliseconds
- It calculates the current playback state for all windows
- It pushes that data to two topics: `/topic/playback` and `/topic/sync`

**Frontend (`websocket.js`):**
- Connects to the raw WebSocket endpoint: `ws://localhost:8080/ws-sequencer-raw`
- Sends a STOMP CONNECT frame on open
- Subscribes to `/topic/playback` and `/topic/sync`
- When a message arrives, it parses the STOMP frame and calls the registered callback in the React component
- If the connection drops, it auto-reconnects after 3 seconds

**Fallback:**
- If the WebSocket is not yet connected, the frontend falls back to polling the REST API (`/api/windows/playback`) every 1 second until WebSocket connects.

### WebSocket Endpoints

| Endpoint | Description |
|---|---|
| `/ws-sequencer-raw` | Native WebSocket (used by the frontend) |
| `/ws-sequencer` | SockJS-compatible endpoint (also available) |
| `/topic/playback` | Topic where playback state is pushed |
| `/topic/sync` | Topic where sync broadcast state is pushed |

---

## Configuration

### `application.properties`

| Property | Description |
|---|---|
| `server.port` | Defaults to `8080`, reads from `PORT` environment variable |
| `spring.datasource.url` | Database URL, reads from `SPRING_DATASOURCE_URL` or `DATABASE_URL` env var; falls back to H2 |
| `spring.datasource.username` | Reads from `SPRING_DATASOURCE_USERNAME`; defaults to `sa` |
| `spring.datasource.password` | Reads from `SPRING_DATASOURCE_PASSWORD`; defaults to empty |
| `spring.jpa.database-platform` | Reads from `SPRING_JPA_DATABASE_PLATFORM`; defaults to H2 dialect |
| `spring.jpa.hibernate.ddl-auto` | Set to `update` — Hibernate creates/updates tables automatically |

---

## Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 21 |
| Maven | 3.6+ |
| Node.js | 18+ |
| PostgreSQL | 14+ (for local dev with persistent database) |
| Docker | 24+ (optional, for container deployment) |

---

## How to Run Locally

### 1. Database Setup (PostgreSQL)

Create a database named `media-sequencer`:

```sql
CREATE DATABASE "media-sequencer";
```

Update credentials in `src/main/resources/application.properties` if your PostgreSQL username or password is different from the defaults (`postgres` / `root`).

### 2. Start the Backend

```bash
cd multi-window-media-sequencer
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`. The database tables and seed data are created automatically on first run.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`. It connects to the backend at `http://localhost:8080`.

---

## Docker Setup

The Docker build compiles the frontend, embeds it inside the Spring Boot JAR, and runs everything as a single container on one port.

### Build and run with Docker Compose

```bash
docker compose up --build
```

Access the application at `http://localhost:8080`.

### Build the image manually

```bash
docker build -t media-sequencer .
docker run -p 8080:8080 media-sequencer
```

The container uses an embedded H2 in-memory database by default. To connect to PostgreSQL, pass environment variables:

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/media-sequencer \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=yourpassword \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver \
  -e SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect \
  media-sequencer
```

---

## Deployment on Koyeb

1. Push your repository to GitHub.
2. Log in to [https://app.koyeb.com](https://app.koyeb.com).
3. Click **Create Service** and connect your GitHub repository.
4. Set the builder to **Dockerfile**.
5. Set the port to `8080`.
6. Click **Deploy**.

Koyeb builds the Docker image and provides a live HTTPS URL. The application starts with an embedded H2 database. To use PostgreSQL, add the database environment variables listed above in the Koyeb service settings.

---

## Important Commands

| Purpose | Command |
|---|---|
| Start backend | `mvn spring-boot:run` |
| Build backend JAR | `mvn clean package -DskipTests` |
| Start frontend dev server | `npm run dev` |
| Build frontend for production | `npm run build` |
| Run with Docker Compose | `docker compose up --build` |
| Verify backend compilation | `mvn test-compile` |
