# Office Meal App — Build Layers

We build **top-down by capability**, swapping **adapters** later (DB, Redis, SSO, email).

| Layer | Name | What we build now | Connect later |
|-------|------|-------------------|---------------|
| **0** | Foundation | Git repo, Node/TS, scripts, env template | CI/CD, Docker |
| **1** | Shared domain | Types: meals, veg/non-veg, bookings, roles | Same types in all apps |
| **2** | Data access (ports) | Repository **interfaces** + **in-memory** stores | PostgreSQL repositories |
| **3** | Business logic | Booking, QR, serve, feedback, escalation rules | Same services, new repos |
| **4** | API (HTTP) | REST routes, validation, error handling | API gateway, rate limits |
| **5** | Cross-cutting mocks | Dev login, console “email”, audit log | Azure AD, SendGrid, Teams |
| **6** | Employee UI | Register meals, QR, feedback | SSO in browser |
| **7** | Server UI | Scan QR, manual serve, veg/non-veg display | Tablet deploy |
| **8** | Admin UI | Reports, veg/non-veg counts, config | BI tools |
| **9** | Integrations | — | Postgres, Redis, SSO, notifications, cloud |

**Current focus:** Layers **0–8** complete + **Render deploy** + **Phase 2A** (PostgreSQL optional, role enforcement, admin feedback/no-shows).

**Next:** Layer **9** remainder (SSO, real email, cron, HR import).
