# 🎸 Zikstock

Zikstock is a platform to help musicians play music.

## 🎯 Our Goal

**How can Zikstock do this?**  
Zikstock allows you to store the musical resources you need to learn a new song, decide which song to play with your friends, and so on.

A musical resource is a Web link to a tablature, a tutorial, a backing track, or anything you need to play music alone or together.  
You can group these resources into **songs**, and group those songs into a **songbook**.

---

## 📂 Monorepo Structure

This repository is structured as a monorepo consisting of two main sub-projects:

1.  **`backend/`**: An Express & Node.js API written in TypeScript, backed by Firebase Firestore.
2.  **`frontend/`**: A React single-page application built with TypeScript, Vite, and Zustand.

Each sub-project has its own dedicated, detailed documentation. Please refer to their respective README files for setup instructions, available scripts, and architecture notes:

*   📖 **Backend Documentation**: [backend/README.md](file:///Users/manu/workspace/zikstock/backend/README.md)
*   📖 **Frontend Documentation**: [frontend/README.md](file:///Users/manu/workspace/zikstock/frontend/README.md)

---

## 🚀 Quick Local Setup (At a Glance)

To get both the frontend and backend running locally on your machine:

### 1. Launch the Database Emulator (Root)
From this repository root directory, spin up the local Firestore Emulator via Docker Compose:
```bash
docker compose up -d
```
The emulator will start on `localhost:8080`.

### 2. Launch the Backend
Open a new terminal window or tab, install backend dependencies, and start the API in development mode:
```bash
cd backend
pnpm install
pnpm dev
```
The API is now running on `http://localhost:3000`.

### 3. Launch the Frontend
Open another terminal window or tab, install frontend dependencies, and start the development server:
```bash
cd frontend
pnpm install
pnpm dev
```
The application is now running on `http://localhost:5173`.

---

## 🏗️ Technical & Team Guidelines

All contributions to this repository must follow the technical rules outlined in [Agents.md](file:///Users/manu/workspace/zikstock/Agents.md):

*   **Pure TypeScript**: Used consistently across the entire stack.
*   **Package Management**: Strictly using **`pnpm`** (npm and yarn are prohibited).
*   **Backend Architecture**: Uses Functional Architecture principles (purely functional controllers, repos, and domains). Class-based OOP and heavy abstraction layers (Ports/Adapters, DI) are prohibited to keep the codebase simple and clean.
*   **Frontend UI**: Designed for high visual fidelity ("wow" factor, elegant glassmorphism, responsive, custom animations) using Zustand for clean state management.
