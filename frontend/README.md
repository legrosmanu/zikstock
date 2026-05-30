# 🎨 Zikstock Frontend Application

A responsive and visually stunning React single-page application powered by Vite, Zustand for state management, and custom Vanilla CSS with modern glassmorphism design and micro-animations.

---

## 🚀 Quick Start for Development

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   **Node.js** (version `>= 20`)
*   **pnpm** (version `>= 10` - strictly enforced by package policies)

### 2. Setup and Run the Frontend
Go to the `frontend/` directory, install the dependencies, and start the Vite local development server:

```bash
cd frontend
pnpm install
pnpm dev
```

The app will start with hot-reloading (HMR) and can be accessed at:
**`http://localhost:5173`** (or the URL printed in your terminal).

---

## 🛠️ Available NPM Scripts

All commands should be run using `pnpm` inside the `frontend/` folder:

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the local Vite development server with Hot Module Replacement (HMR). |
| `pnpm build` | Compiles TypeScript and builds an optimized, minified production package into the `dist/` directory. |
| `pnpm preview` | Starts a local server to preview the built production bundle from the `dist/` directory. |
| `pnpm lint` | Runs ESLint to check syntax, style rules, and types across the React/TypeScript files. |

---

## 🏗️ Architecture & Style Guidelines

As per the project's [Agents.md](file:///Users/manu/workspace/zikstock/Agents.md) rules, the frontend is built with high standards of quality and modern designs:

*   **Aesthetics**: Sleek design featuring rich glassmorphism, tailored color palettes (using CSS variables in `index.css`), modern typography (Inter/Outfit), and subtle interactive micro-animations for an elevated user experience.
*   **Icons**: Supported by `lucide-react` for simple, vector-perfect iconography.
*   **State Management**: Uses `zustand` to manage application state in a simple, decoupled, reactive, and highly performant way.
*   **Only TypeScript**: No pure JavaScript, TypeScript type-checking is active on builds and lints.
*   **Tailwind Policy**: Standard Vanilla CSS is preferred for visual control, keeping utility classes out of component templates unless explicitly requested.
