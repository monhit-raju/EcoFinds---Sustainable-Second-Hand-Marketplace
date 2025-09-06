# EcoFinds - Starter Repo

This repository contains a minimal starter implementation for the EcoFinds hackathon MVP: backend (Node + Express + Prisma + SQLite), web (React + Vite + Tailwind), and mobile (Expo).

## Quickstart

### 1) Backend

```bash
cd server
npm install
# initialize prisma + sqlite
npx prisma generate
npx prisma migrate dev --name init
# start server
npm run dev
```

The server will run at http://localhost:4000. API is under /api.

### 2) Web

In a new terminal:

```bash
cd web
npm install
# set API base by creating .env or use default
# start dev server
npm run dev
```

Open http://localhost:5173 (vite default) and the app will fetch from backend at http://localhost:4000/api.

If you want to point the web client to a different API, set environment variable `VITE_API_BASE`.

### 3) Mobile (Expo)

In a new terminal:

```bash
cd mobile
npm install
npm run start
```

Open the Expo app on your phone or run on simulator. For Android/iOS simulator, replace `localhost` with your machine IP in mobile/App.js if needed.

## Notes
- This is a minimal starter meant for hackathon / prototype. Add validation, error handling, and production configuration before deploying.
- File uploads are stored locally in `server/uploads` for the prototype. For production use S3/Cloudinary.
- JWT secret is in `.env` - change in production.