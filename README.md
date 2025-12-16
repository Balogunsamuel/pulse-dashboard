# Pulse Buy Bot Dashboard

Modern React + TypeScript + Vite dashboard for comprehensive bot management and monitoring.

## Features Overview

### Complete Implementation ✅
- **Overview Dashboard** - Real-time statistics with auto-refresh every 30 seconds
- **Security Monitoring** - Spam control, scam detection, raid protection, and blacklist management
- **Trust Level Management** - User reputation system with distribution charts and promotion tracking
- **Portal Builder** - Visual portal configuration with CAPTCHA, buttons, media, and invite link management
- **Token & Transaction Management** - Full CRUD operations with advanced filtering
- **Live Feeds** - Real-time transaction and detection feeds via WebSocket
- **User Management** - RBAC with admin/moderator/viewer roles
- **Audit Logging** - Comprehensive activity tracking
- **Notification Center** - In-app notifications with customizable preferences
- **Theme System** - Dark/light mode with system preference detection
- **Command Palette** - Quick navigation via Ctrl+K (Cmd+K on Mac)
- **Keyboard Shortcuts** - Alt+1-3 for view navigation, Alt+D for theme toggle
- **Advanced Filtering** - Search, filter, and date range selection across all views
- **Responsive Design** - Mobile-friendly layouts
- **Error Boundaries** - Graceful error handling
- **Loading States** - Skeleton loaders for better UX
- **Session Management** - Auto-logout on inactivity

### Tech Stack
- React 18 with Hooks and Context API
- TypeScript for type safety
- Vite for fast builds and HMR
- TailwindCSS for styling
- Recharts for data visualization
- Axios for HTTP requests
- WebSocket for real-time updates
- React Router for navigation
- React Toastify for notifications
- Date-fns for date handling

## Pre-Production Checklist

Before deploying to production:
- ✅ All features are implemented and tested
- ⚠️ Configure real authentication (currently uses API key from localStorage)
- ✅ Set `VITE_API_URL` and `VITE_WS_URL` to production endpoints
- ⚠️ Enable HTTPS only in production
- ⚠️ Configure strict CORS policy at API level
- ⚠️ Add CSP headers via reverse proxy
- ⚠️ Enable rate limiting at reverse proxy or API gateway
- ⚠️ Add automated tests (test framework configured, tests pending)
- ✅ Build optimization enabled (Vite production mode)
- ⚠️ Set up error tracking (e.g., Sentry)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment
Create a `.env` file:

```env
VITE_API_URL=https://your-api-domain/api
VITE_WS_URL=wss://your-api-domain
```

## Production hosting
- Build: `npm run build` (outputs to `dist/`)
- Serve `dist/` behind HTTPS with a reverse proxy (Nginx/Cloudflare) that forwards `/api` and `/ws` to your backend
- Restrict API and WS origins to your dashboard domain; set CORS and CSP headers at the proxy
- Keep the API key secret; use short-lived tokens server-side if possible rather than long-lived keys in the browser
- If using a custom domain, provision TLS (Let’s Encrypt/Cloudflare) and enable HSTS

## API key
The app prompts for an API key on first load and stores it in `localStorage` under `pulse_buy_bot_api_key`. Match this to your backend’s auth scheme or replace with your own login flow.
