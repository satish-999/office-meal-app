# Deploy Office Meal App (permanent URL)

Deploy as **one Node service**: API + built web UI on the same URL.

---

## Option 1 — Render (recommended, free tier)

### Steps

1. Push project to **GitHub** (include `packages/web`).

2. Go to [render.com](https://render.com) → **New → Web Service** → connect repo.

3. Settings:

| Field | Value |
|-------|--------|
| **Runtime** | Node |
| **Build command** | `npm install && npm run build` |
| **Start command** | `npm start` |
| **Instance type** | Free |

4. **Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render sets this automatically; optional) |
| `DEV_QR_SECRET` | long random string |
| `DEV_AUTH_SECRET` | long random string |

5. Deploy → you get a permanent URL like:

   **`https://office-meal-app.onrender.com`**

6. Share that URL with your manager (any Wi‑Fi / mobile data).

### Or use Blueprint

If repo includes `render.yaml`, use **New → Blueprint** and connect the repo.

---

## Option 2 — Test production on your PC

```powershell
cd office-meal-app
npm install
npm run build
$env:NODE_ENV="production"
npm start
```

Open **http://localhost:3001** — single URL serves UI + API.

---

## Option 3 — Temporary demo (laptop must stay on)

```powershell
npm run dev          # terminal 1
npm run tunnel       # terminal 2 → copy trycloudflare.com URL
```

Not permanent; link changes each run.

---

## After deploy

| Login | Role |
|-------|------|
| EMP001 | Employee |
| SRV001 | Server |
| ADM001 | Admin |

**Note:** In-memory data resets when the service restarts. Add PostgreSQL (Layer 9) for persistence.

---

## Camera QR on phone

Server **Scan QR** page uses the device camera. On HTTPS (Render) camera works better than HTTP on some browsers.

---

## Custom domain (optional)

In Render → your service → **Custom Domains** → add e.g. `meals.yourcompany.com`.
