# Office Meal Management App (Local Build)

Layer **0–8**: API + **web screens** with in-memory storage and mock auth/email.  
PostgreSQL, Redis, SSO, and SendGrid connect later (Layer 9).

## Build layers (current status)


| Layer                               | Status |
| ----------------------------------- | ------ |
| 0 Foundation                        | Done   |
| 1 Shared domain (incl. veg/non-veg) | Done   |
| 2 In-memory repositories            | Done   |
| 3 Business services                 | Done   |
| 4 REST API                          | Done   |
| 5 Mock auth & notifications         | Done   |
| 6 Employee UI                       | Done   |
| 7 Server UI                         | Done   |
| 8 Admin UI                          | Done   |
| 9 Cloud integrations                | Later  |


See [docs/BUILD-LAYERS.md](./docs/BUILD-LAYERS.md).

## Prerequisites

- Node.js 18+
- npm
- Git

## Setup

```powershell
cd c:\Users\satis\OneDrive\Desktop\office-meal-app
copy .env.example .env
npm install
npm run dev
```

| App | URL |
|-----|-----|
| **Web screens** | http://localhost:5173 |
| **API health** | http://localhost:3001/health (match `PORT` in `.env`) |

`npm run dev` starts API + web together. Or run `npm run dev:api` and `npm run dev:web` in two terminals.

## Demo users (after seed)


| Employee code | Use as                            |
| ------------- | --------------------------------- |
| EMP001        | Employee (default veg)            |
| EMP002        | Employee (default non-veg)        |
| SRV001        | Server (login with role `server`) |
| ADM001        | Admin (login with role `admin`)   |


## Quick API test (PowerShell)

### 1) Login as employee

```powershell
$login = Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/dev-login `
  -ContentType "application/json" `
  -Body '{"employeeCode":"EMP001","role":"employee"}'
$token = $login.token
```

### 2) List tomorrow's meal schedules

```powershell
# Replace DATE with tomorrow YYYY-MM-DD from seed log, or query param
Invoke-RestMethod -Uri "http://localhost:3000/api/employee/schedules?date=2026-05-29" `
  -Headers @{ Authorization = "Bearer $token" }
```

### 3) Register for lunch (veg)

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/employee/bookings `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"date":"2026-05-29","mealType":"lunch","dietType":"veg"}'
```

### 4) Get QR token

```powershell
# Use booking id from step 3
Invoke-RestMethod -Uri "http://localhost:3000/api/employee/bookings/<BOOKING_ID>/qr" `
  -Headers @{ Authorization = "Bearer $token" }
```

### 5) Server scans QR

```powershell
$server = Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/dev-login `
  -ContentType "application/json" `
  -Body '{"employeeCode":"SRV001","role":"server"}'
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/server/scan `
  -Headers @{ Authorization = "Bearer $($server.token)" } `
  -ContentType "application/json" `
  -Body "{\"qrToken\":\"<QR_TOKEN>\"}"
```

### 6) Admin daily report (veg / non-veg counts)

```powershell
$admin = Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/dev-login `
  -ContentType "application/json" `
  -Body '{"employeeCode":"ADM001","role":"admin"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/reports/daily?date=2026-05-29" `
  -Headers @{ Authorization = "Bearer $($admin.token)" }
```

## API summary


| Method | Path                            | Role         |
| ------ | ------------------------------- | ------------ |
| POST   | `/api/auth/dev-login`           | Public (dev) |
| GET    | `/api/employee/schedules`       | Employee     |
| POST   | `/api/employee/bookings`        | Employee     |
| GET    | `/api/employee/bookings`        | Employee     |
| DELETE | `/api/employee/bookings/:id`    | Employee     |
| GET    | `/api/employee/bookings/:id/qr` | Employee     |
| POST   | `/api/employee/feedback`        | Employee     |
| POST   | `/api/server/scan`              | Server       |
| POST   | `/api/server/manual-serve`      | Server       |
| GET    | `/api/admin/reports/daily`      | Admin        |
| GET    | `/api/admin/bookings`           | Admin        |
| POST   | `/api/admin/jobs/no-shows`      | Admin        |


## Project structure

```
office-meal-app/
  packages/
    shared/          # Types: MealType, DietType (veg/non_veg), Booking, etc.
    backend/         # API + services + in-memory repos
  docs/
```

## Next steps

1. Run and test API locally
2. Build **Employee web app** (Layer 6)
3. Build **Server scanner UI** (Layer 7)
4. Build **Admin dashboard** (Layer 8)
5. Swap in PostgreSQL + SSO + email adapters (Layer 9)

