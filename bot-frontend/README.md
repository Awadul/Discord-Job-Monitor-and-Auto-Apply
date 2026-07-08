# Job Finder Bot - Frontend Console

A premium, responsive, and secure React + Vite control panel designed to manage and monitor the Discord Job Search Bot automation.

---

## Key Features

*   **Modern Premium Dashboard**: High-fidelity dark mode interface utilizing modern glassmorphism panels, status indicators, and micro-animations.
*   **Real-time Control Panel**: Trigger actions to start (`GET /run-script`), pause (`POST /pause-bot`), and resume (`POST /resume-bot`) the automated bot instance.
*   **Live Execution Terminal**: Stream simulated/real-time execution logs directly to a dedicated console inside the dashboard.
*   **Secure Session Exchange**: Fully secure HTTP-only cookie authentication mechanism preventing XSS token theft. No sensitive JWT secrets are stored in `localStorage`.

---

## Technical Stack

*   **Core**: React 19, JavaScript (ESM)
*   **Build Tool**: Vite 8
*   **Styling**: Tailwind CSS v4.0 (integrated natively using `@tailwindcss/vite` plugin)
*   **Icons**: Lucide React

---

## Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).

### 2. Environment Configuration

Create a `.env` file in the root of the frontend folder:

```env
Environment=Development
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Installation

Install all required NPM packages:

```bash
npm install
```

### 4. Running the App

Start the Vite development server:

```bash
npm run dev
```

The app will start at `http://localhost:5173`.

### 5. Production Build

To compile a optimized production bundle (which generates minified CSS/JS and assets in the `dist/` directory):

```bash
npm run build
```

---

## Security Architecture

The application communicates with the backend API directly using cross-origin resource sharing (CORS). 

*   **Cookie Management**: Token authentication is stored exclusively as an `httpOnly` cookie. This makes it impossible for client-side scripts to access the token.
*   **Credential Sharing**: Every request sent from the frontend includes the `credentials: 'include'` header option. This prompts the browser to automatically forward the session cookie to the backend port (`localhost:5000`).
