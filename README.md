# LedgerPro Suite 💳

A premium, full-stack financial ledger management application built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Node.js**.

## 🚀 Key Features

- **High-End UI/UX**: Glassmorphism design system inspired by modern enterprise apps.
- **Micro-Animations**: Smooth transitions powered by Framer Motion.
- **Secure Authentication**: JWT-based login with cookie-based session management.
- **Transaction Engine**: ACID-compliant ledger transactions with real-time balance tracking.
- **Auto-Deployment**: Pre-configured for seamless Vercel deployment (Serverless Backend + Static Frontend).

## 📁 Project Structure

```text
├── backend/            # Express.js Server
│   ├── src/            # Core logic (controllers, routes, models)
│   └── server.js      # Main entry point
├── frontend/           # React Application (Vite + Tailwind v4)
│   ├── src/            # UI components, pages, and hooks
│   └── vite.config.js # Modern Tailwind v4 integration
└── vercel.json        # Production routing & security configuration
```

## 🛠️ Local Development

1. **Bootstrap the environment**:

   ```bash
   npm run install-all
   ```

2. **Launch development servers**:

   ```bash
   # Run frontend (Vite)
   npm run frontend

   # Run backend (Express)
   npm run backend
   ```

## 🌐 Production Deployment

This project is optimized for **Vercel**. Simply push your changes to GitHub and connect your repository to Vercel.

**Required Environment Variables (Backend):**

- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV` (production)
- `CORS_ORIGIN`

---

Built with ❤️ by Antigravity
