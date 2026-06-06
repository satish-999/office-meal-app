# Phase 2A — Free PostgreSQL (Neon)

Data persists after Render restarts when `DATABASE_URL` is set.

## 1) Create free Neon database

1. Go to [https://neon.tech](https://neon.tech) → sign up (free)
2. **New Project** → name: `office-meal-app`
3. Copy the **connection string** (starts with `postgresql://...`)
4. Use the pooled connection string if offered (better for serverless)

## 2) Local test (optional)

Add to `.env` in project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
```

Then:

```powershell
cd c:\Users\satis\OneDrive\Desktop\office-meal-app
npm install
npm run build
npm start
```

Open `http://localhost:3001/health` — should show `"storage":"postgres"`.

## 3) Render production

1. [Render Dashboard](https://dashboard.render.com) → open **office-meal-app-279y** (your web service)
2. Left menu → **Environment** (not Blueprint settings)
3. **Add Environment Variable**
   - Key: `DATABASE_URL` (exact spelling)
   - Value: full Neon string starting with `postgresql://` (no quotes)
4. **Save Changes** — wait for auto-redeploy, or **Manual Deploy**
5. **Logs** tab — look for: `Storage: PostgreSQL`
6. Check `/health`:
   - `"databaseUrlSet": true` and `"storage": "postgres"` = success
   - `"databaseUrlSet": false` = variable not on this service — add again on **office-meal-app-279y**

## 4) What changes

| Before | After |
|--------|--------|
| Data lost on restart | Bookings, menus, feedback kept |
| In-memory only | PostgreSQL tables auto-created on startup |

Without `DATABASE_URL`, the app still runs in **in-memory** mode (demo).

## 5) Demo logins (unchanged)

| Code | Role |
|------|------|
| EMP001 | Employee |
| SRV001 | Server |
| ADM001 | Admin |

Roles are assigned by the server — you cannot pick admin while using EMP001.

## 6) New admin features (Phase 2A)

- **Daily report** → **Process no-shows for this date**
- **Feedback** tab → view employee feedback by date
