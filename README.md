# Nutrition Counselling Web Application (MERN Stack)

A full MERN stack application for nutrition counselling: user signup with detailed health/dietary profiling, BMI tracking with trend graphs and auto-generated insights, an AI nutrition chatbot (OpenRouter), appointment booking, a nutrition articles hub, standalone calculator tools, and a role-based admin dashboard.

## Project Structure

```
nutrition-app/
├── backend/     Node.js + Express + MongoDB API
└── frontend/    React + Vite + Tailwind CSS SPA
```

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in your MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY, SMTP settings
npm install
npm run seed:admin        # creates the first admin account (uses ADMIN_EMAIL/ADMIN_PASSWORD from .env)
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173, proxies /api to the backend
```

Open http://localhost:5173, sign up as a client, or log in with the seeded admin account to access `/admin`.

## Key Environment Variables (backend/.env)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_URL` | Frontend origin, used for CORS and password-reset links |
| `OPENROUTER_API_KEY` | Powers the AI nutrition chatbot |
| `SMTP_*` / `EMAIL_FROM` | Used to send "forgot password" emails via Nodemailer |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

## Notable Design Decisions

- **Role-based access is enforced server-side** (`middleware/authMiddleware.js` → `authorize('admin')`), not just hidden in the UI. All `/api/admin/*` routes require a valid JWT **and** the `admin` role.
- **BMI history** is a separate collection (`BmiRecord`) so every weight update preserves a historical trend, powering the dashboard chart and the auto-generated insight text.
- **Appointments store a snapshot** of the user's key stats (name, age, BMI, etc.) at time of booking, so historical appointments remain accurate even if the user's profile changes later.
- **Tools calculators are stateless** — the "Tools" BMI/water/calorie calculators never touch the database, per the spec.
- **The chatbot system prompt is rebuilt server-side on every request** from the authenticated user's live profile (age, BMI, dietary habits, lifestyle, etc.), and is explicitly instructed not to diagnose or prescribe medication.
- **Security**: bcrypt password hashing, JWT auth, Helmet, CORS allow-list, general + auth + chatbot rate limiting, and centralized error handling that never leaks stack traces in production.

## Deployment

- **Frontend** → Vercel (`npm run build`, output in `frontend/dist`)
- **Backend** → Render (Node web service, start command `npm start`)
- **Database** → MongoDB Atlas

Remember to set `CLIENT_URL` on the backend to your deployed frontend URL, and point the frontend's API calls at your deployed backend URL if you're not using the Vite dev proxy (see `frontend/.env.example`).
