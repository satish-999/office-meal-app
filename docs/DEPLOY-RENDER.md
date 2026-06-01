# Deploy on Render (easiest — recommended)

**Why Render over AWS for you**

| | Render | AWS |
|---|--------|-----|
| Setup time | ~20–30 min | 2–4+ hours |
| Cost now | Free tier | Credits + trial ending |
| Permanent HTTPS URL | Yes | Yes (more setup) |
| Needs AWS password/CLI | No | Yes |
| Already in this repo | `render.yaml` | Would need new scripts |

**One URL** serves login, register, menu, server scan, admin — works on mobile data.

---

## Before you start

- [ ] GitHub account: [https://github.com/signup](https://github.com/signup)
- [ ] Render account: [https://render.com](https://render.com) (sign in with GitHub)
- [ ] Project folder: `office-  meal-app` on your PC

---

## Step 1 — Push code to GitHub

### A) Create empty repo on GitHub

1. GitHub → **+** → **New repository**
2. Name: `office-meal-app`
3. **Public** or Private
4. **Do not** add README (you already have code)
5. Copy the repo URL, e.g. `https://github.com/YOUR_USERNAME/office-meal-app.git`

### B) Push from PowerShell

```powershell
cd c:\Users\satis\OneDrive\Desktop\office-meal-app

git init
git add .
git commit -m "Office meal app ready for Render deploy"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/office-meal-app.git
git push -u origin main
```

If `git push` asks for login, use GitHub **Personal Access Token** as password (not GitHub password).

---

## Step 2 — Deploy on Render

### Option A — Blueprint (fastest)

1. [https://dashboard.render.com](https://dashboard.render.com)
2. **New +** → **Blueprint**
3. Connect GitHub → select `office-meal-app`
4. Render reads `render.yaml` automatically
5. **Apply** → wait ~5–10 min for first build

### Option B — Manual web service

1. **New +** → **Web Service**
2. Connect repo `office-meal-app`
3. Settings:

| Field | Value |
|-------|--------|
| Name | `office-meal-app` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Plan | **Free** |

4. Environment variables (Render may auto-add from blueprint):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DEV_QR_SECRET` | (Generate or any long random string) |
| `DEV_AUTH_SECRET` | (Generate or any long random string) |

5. **Create Web Service**

---

## Step 3 — Get your permanent link

After deploy succeeds:

**`https://office-meal-app.onrender.com`**

(or the name you chose — shown at top of Render dashboard)

Test:

- `https://YOUR-APP.onrender.com/health` → JSON `"status":"ok"`
- `https://YOUR-APP.onrender.com/` → **Login screen**

Share the **main URL** with your manager (any Wi‑Fi / mobile data).

---

## Demo logins

| Code | Role on login screen |
|------|----------------------|
| EMP001 | Employee |
| SRV001 | Server |
| ADM001 | Admin |

**Admin:** Menu admin → add items (one per line) for tomorrow’s date  
**Employee:** same **date** on Menu / Register

---

## Free tier notes

- App **sleeps** after ~15 min idle → first open may take **30–60 sec** (cold start)
- **Data resets** when Render redeploys or restarts (in-memory DB)
- For lasting data later → add **PostgreSQL** on Render (Phase 2)

---

## Redeploy after code changes

```powershell
git add .
git commit -m "Update app"
git push
```

Render auto-rebuilds on push to `main`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build failed | Render → **Logs** tab. Common fix: `buildCommand` must use `npm install --include=dev` (see `render.yaml`) so TypeScript/Vite install during build |
| Blank page | Check **Logs**; ensure `npm run build` succeeded |
| Login fails | Check env vars `DEV_AUTH_SECRET` set |
| Menu empty | Admin: add menu for **same date** employee selects |
| Camera QR on server | Use **HTTPS** URL (Render gives HTTPS) — allow camera in browser |

---

## Local test (same as Render)

```powershell
cd office-meal-app
npm install
npm run build
$env:NODE_ENV="production"
npm start
```

Open **http://localhost:3001**

---

## Next after Render works

1. PostgreSQL on Render (data persistence)  
2. Custom domain (optional)  
3. Email / SSO (company IT)

See [DEPLOY.md](./DEPLOY.md) for other options.
