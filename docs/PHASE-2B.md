# Phase 2B — Employees, email, nightly cron (free)

## 1) Employee CSV import

1. Login as **ADM001**
2. **Employees** tab
3. Paste CSV (see sample on page) → **Import CSV**
4. Existing `employeeCode` rows update; new codes are added

**CSV columns:**

```csv
employeeCode,name,email,department,defaultDiet,role,active
EMP003,Anita Rao,anita@company.com,Finance,veg,employee,true
```

---

## 2) Real email — Brevo (free)

[Brevo](https://www.brevo.com) free tier: ~300 emails/day.

### Setup

1. Brevo → **SMTP & API** → create **API key**
2. Brevo → **Senders** → add/verify sender email (e.g. your Gmail)
3. Render → **Environment** → add:

| Key | Example |
|-----|---------|
| `BREVO_API_KEY` | `xkeysib-...` |
| `EMAIL_FROM` | `you@gmail.com` (verified in Brevo) |
| `EMAIL_FROM_NAME` | `Office Meal` |

4. **Manual Deploy**

Check `/health` → `"emailConfigured": true`

Without these vars, emails still log as `[MOCK EMAIL]` in Render logs.

---

## 3) Nightly no-show cron — GitHub Actions (free)

### Render

Add environment variable:

| Key | Value |
|-----|--------|
| `CRON_SECRET` | long random string (e.g. `openssl rand -hex 32`) |

### GitHub

Repo → **Settings** → **Secrets and variables** → **Actions** → New secret:

| Secret | Value |
|--------|--------|
| `RENDER_APP_URL` | `https://office-meal-app-279y.onrender.com` |
| `CRON_SECRET` | **same** as Render |

Workflow file: `.github/workflows/nightly-no-shows.yml`  
Runs daily at **18:00 UTC** (~11:30 PM IST). Edit `cron` if needed.

**Test manually:** GitHub → **Actions** → **Nightly no-show job** → **Run workflow**

---

## 4) Deploy Phase 2B

```powershell
git add .
git commit -m "Phase 2B: employee CSV import, Brevo email, nightly cron"
git push origin main
```

Render auto-redeploys from `main`.

---

## Health check summary

```json
{
  "storage": "postgres",
  "emailConfigured": true
}
```
