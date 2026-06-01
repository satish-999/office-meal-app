# Share the app with your manager

## Why `http://localhost:5173` does not work for them

`localhost` always means **their own computer**, not yours.  
Your manager must use **your PC’s network address** or a **public tunnel URL**.

---

## Option A — Same office Wi‑Fi / LAN (easiest)

### On your PC

1. Start the app (keep terminal open):

```powershell
cd c:\Users\satis\OneDrive\Desktop\office-meal-app
npm run dev
```

2. Find your PC’s IP address:

```powershell
ipconfig
```

Look for **IPv4 Address** under Wi‑Fi or Ethernet, e.g. `192.168.1.42`.

3. Allow Windows Firewall (first time only):

```powershell
netsh advfirewall firewall add rule name="Office Meal Web" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Office Meal API" dir=in action=allow protocol=TCP localport=3001
```

### Link to send your manager

Replace `YOUR_IP` with your IPv4 address:

**http://YOUR_IP:5173**

Example: **http://192.168.1.42:5173**

Requirements:

- Your PC is on and `npm run dev` is running  
- Manager is on the **same network** (same office Wi‑Fi)  
- Manager uses **http** (not https)

---

## Option B — Manager on different Wi‑Fi (home / other network)

Your PC must stay on. You need **two terminals** running:

**Terminal 1 — app**

```powershell
cd c:\Users\satis\OneDrive\Desktop\office-meal-app
npm run dev
```

**Terminal 2 — public link (free Cloudflare tunnel)**

```powershell
cd c:\Users\satis\OneDrive\Desktop\office-meal-app
npm run tunnel
```

Copy the `https://….trycloudflare.com` URL from Terminal 2 and send **that** to your manager.

- Link works from **anywhere** (not only office Wi‑Fi).  
- Link **stops working** when you close Terminal 2 or shut down your PC.  
- Each time you run `npm run tunnel`, you may get a **new** URL.

### Alternative: ngrok

```powershell
ngrok http 5173
```

Send the `https://….ngrok-free.app` URL.

---

## Demo login (for manager review)

| Code   | Role     |
|--------|----------|
| EMP001 | Employee |
| SRV001 | Server   |
| ADM001 | Admin    |

---

## If it still does not load

| Problem | Fix |
|---------|-----|
| “Can’t reach this page” | App not running — run `npm run dev` |
| Works on your PC, not manager’s | Wrong link — use `http://YOUR_IP:5173`, not `localhost` |
| Firewall blocked | Run firewall rules above |
| Different Wi‑Fi | Use Option B (ngrok) |
| VPN | Try turning VPN off on one side |

---

## Production (later)

For a permanent link, deploy to Azure / Render / company server — not `localhost`.
