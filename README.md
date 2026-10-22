# medix-delivery

Monorepo for pharmacy delivery PWA with standalone customer app.

## Structure

```
medix-delivery/
  apps/
    customer/     -> Standalone Customer PWA (React 18 + Vite + Tailwind CSS + PWA)
                     Routes: /search, /cart, /orders, /account
  server/         -> Node.js + Express + MongoDB (Mongoose)
```

## Running the App

### 1. Start Customer App (Vite Dev Server)

```bash
npm run dev:customer
```
- **Local Access:** http://localhost:5173/
- **Mobile on Same Wi-Fi:** http://192.168.1.13:5173/ (or check your machine's Wi-Fi IP)

### 2. Start Backend Server (Express + Nodemon)

```bash
npm run dev:server
```
- **Health Check:** http://localhost:5000/health

## Customer App Routes
- `/search` (Default tab & catalog search)
- `/cart` (Cart summary & medicine quantity)
- `/orders` (Active and past deliveries)
- `/account` (User profile & settings)
*(Any unknown routes automatically redirect to `/search`)*
