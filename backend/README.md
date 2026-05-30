# ⚙️ Zikstock Backend API

Fast, lightweight Express & TypeScript API serving the Zikstock domain. Built following Clean Code and Functional Architecture principles, ready for deployment on GCP Cloud Run.

---

## 🚀 Quick Start for Development

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   **Node.js** (version `>= 20`)
*   **pnpm** (version `>= 10` - strictly enforced by package policies)
*   **Docker** (highly recommended for running the Firestore Emulator)

### 2. Launch the Firestore Emulator
The backend requires a running Firestore instance. For local development and testing, use the Firestore Emulator.

*   **Option A: Using Docker (Recommended)**
    Run the emulator from the **repository root directory**:
    ```bash
    docker compose up -d
    ```
    This will launch the emulator on `localhost:8080`.

*   **Option B: Manual Installation**
    If you don't have Docker, install and start the emulator globally:
    ```bash
    npm install -g firebase-tools
    firebase emulators:start --only firestore
    ```

### 3. Setup and Run the Backend
Go to the `backend/` directory, install dependencies, and start the development server:

```bash
cd backend
pnpm install
pnpm dev
```
The server will start, typically listening on **`http://localhost:3000`**.

---

## 🛠️ Available NPM Scripts

All commands should be run using `pnpm` inside the `backend/` folder:

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the server in development mode with hot-reloading (`nodemon` watches changes). |
| `pnpm build` | Compiles TypeScript files into the `dist/` directory using `tsconfig.build.json`. |
| `pnpm start` | Launches the compiled production application from `dist/index.js`. |
| `pnpm test` | Runs the integration and unit tests using Jest (`.env.test` variables are automatically loaded). |
| `pnpm lint` | Runs ESLint checks across the codebase. |
| `pnpm lint:fix` | Automatically corrects fixable ESLint errors. |

---

## ⚙️ Environment Variables

The backend supports configuration via environment variables. Create a local `.env` file in the `backend/` directory if you need custom options:

*   `PORT`: Port for the API server (default: `3000`).
*   `FIRESTORE_EMULATOR_HOST`: Host and port of the running emulator (e.g., `localhost:8080`). When set, the Firestore Client automatically redirects queries to the emulator, bypassing GCP credentials.
*   `GOOGLE_CLIENT_ID`: Google OAuth2 client ID used by the authentication middleware to validate incoming JWT audiences.

For testing, environment variables are loaded automatically from the `.env.test` file.

---

## 🏗️ Architecture Guidelines (Architect Rules)

As per the project's [Agents.md](file:///Users/manu/workspace/zikstock/Agents.md) rules, the backend follows strict guidelines:
1.  **Purely Functional**: No class-based OOP, Ports/Adapters, or Dependency Injection frameworks. Use clean, modular, exported functions for controllers, repositories, and business logic.
2.  **TypeScript Only**: Consistent types and Zod schemas for validation.
3.  **Infrastructure Decoupling**: Keep domain logic independent of Firestore or external APIs.
