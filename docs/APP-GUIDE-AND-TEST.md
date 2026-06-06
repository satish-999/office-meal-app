# Office Meal App — What’s built & how to test

**Live app:** https://office-meal-app-279y.onrender.com  
**Health check:** https://office-meal-app-279y.onrender.com/health  

Works on phone or laptop, any Wi‑Fi or mobile data. First open after idle may take ~30–60 seconds (Render free tier).

---

## What is completed (~75–80% of pilot scope)

| Area | Status |
|------|--------|
| Employee register meals (breakfast / lunch / dinner, veg & non-veg) | Done |
| Employee menu view by date & diet | Done |
| QR code on bookings for counter scan | Done |
| Server scan QR (camera) + manual serve with reason | Done |
| Admin daily report (registered / served / no-show, veg counts) | Done |
| Admin menu setup (items, cutoff, capacity) | Done |
| Admin all bookings list | Done |
| Employee feedback (meal + dining area) | Done |
| Admin feedback view by date | Done |
| Admin process no-shows + email warnings (Brevo) | Done |
| Admin employee CSV import | Done |
| Data saved in PostgreSQL (Neon) — survives restarts | Done |
| Hosted on Render (24/7, no laptop needed) | Done |
| Nightly no-show job (GitHub Actions) | Done |
| Secure roles (login code decides role, not user) | Done |

**Not yet:** Company Microsoft login (SSO), custom domain, report export, some UX polish.

---

## Demo logins

Enter **employee code** only — role is assigned automatically.

| Code | Role | Use for |
|------|------|---------|
| **EMP001** | Employee | Register meals, QR, feedback (veg default) |
| **EMP002** | Employee | Non-veg employee demo |
| **SRV001** | Server | Scan QR, manual serve |
| **ADM001** | Admin | Reports, menu, employees, feedback |

---

## 15-minute test walkthrough

Use **the same date** on every step (default is often **tomorrow**). Change the **Date** field where shown.

### Step 1 — Admin sets menu (2 min)

1. Open the app URL → **Sign in** with **ADM001** (or quick demo button).
2. Go to **Menu admin**.
3. Pick a **date** (e.g. tomorrow).
4. For **Lunch** (and optionally breakfast/dinner), add menu lines — one dish per line, veg and non-veg sections.
5. Save.

### Step 2 — Employee registers (3 min)

1. **Log out** → sign in **EMP001**.
2. **Register** → same **date** → choose **Lunch** → **Veg** → Register.
3. Optional: log out → **EMP002** → register **Lunch** → **Non-veg**.
4. **My bookings** → same date → **Show QR** (keep open on phone for step 3).

### Step 3 — Server serves (3 min)

1. **Log out** → sign in **SRV001**.
2. **Scan QR** → allow camera → scan employee QR from step 2.  
   - Or paste QR token if camera unavailable.
3. Optional: **Manual serve** → employee code **EMP001**, same date/meal, reason e.g. “Network issue”.

### Step 4 — Admin checks numbers (3 min)

1. **Log out** → sign in **ADM001**.
2. **Daily report** → same **date** → check registered / served / veg & non-veg counts.
3. **All bookings** → see who registered and status.
4. Optional: **Process no-shows for this date** if someone registered but was not scanned (sends email if configured).

### Step 5 — Feedback (2 min)

1. **Log out** → **EMP001** → **Feedback** → rate meal, add dining-area note → submit.
2. **Log out** → **ADM001** → **Feedback** tab → same **date** → see submission.

### Step 6 — Import employees (optional, 2 min)

1. **ADM001** → **Employees** → paste sample CSV on page → **Import CSV** → see updated list.

---

## Quick checks

| Check | Expected |
|-------|----------|
| `/health` | `"storage":"postgres"`, `"status":"ok"` |
| Wrong code login | Error: unknown employee |
| EMP001 cannot open Admin screens | Role enforced server-side |
| Change date on Menu / Bookings | Data loads for that day |
| After Render redeploy | Data still there (PostgreSQL) |

---

## Tips for reviewers

- Use **two devices** (phone = employee QR, laptop = server scan) for the best demo.
- **Admin must add menu** for the date employees use; otherwise register shows no schedule.
- **Cutoff time** on menu blocks late registration (by design).
- For **no-show email** test: register as EMP001, do not scan, then admin **Process no-shows** for that date.

---

## Support / technical

- Repo: `satish-999/office-meal-app` on GitHub  
- Deploy: Render · Database: Neon · Email: Brevo · Cron: GitHub Actions  
- Deeper setup: `docs/DEPLOY-RENDER.md`, `docs/PHASE-2A-NEON.md`, `docs/PHASE-2B.md`
