# 🚍 Bus Management System

A full-stack Bus Management System built with **React + Node.js + MySQL**.

---

## 📁 Project Structure

```
BusManagement/
├── backend/          ← Node.js + Express API
│   ├── config/       ← MySQL DB connection
│   ├── middleware/   ← JWT auth middleware
│   ├── routes/       ← API routes (buses, drivers, etc.)
│   ├── schema.sql    ← MySQL database schema + seed data
│   ├── .env          ← Environment variables
│   └── server.js     ← Entry point
└── frontend/         ← React + Vite app
    └── src/
        ├── pages/    ← All page components
        ├── components/  ← Sidebar, Header, Modal
        └── api/      ← Axios HTTP client
```

---

## ⚙️ Setup Instructions

### 1. Setup MySQL Database
Open MySQL and run:
```sql
source C:\Users\gabson\Desktop\BusManagement\backend\schema.sql
```
Or use MySQL Workbench to import `backend/schema.sql`.

### 2. Configure Database Credentials
Edit `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root       ← Change to your MySQL password
DB_NAME=bus_management
JWT_SECRET=busmanagement_secret_key_2024
PORT=5000
```

### 3. Start Backend
```powershell
cd C:\Users\gabson\Desktop\BusManagement\backend
npm start
```
Backend runs on: http://localhost:5000

### 4. Start Frontend
```powershell
cd C:\Users\gabson\Desktop\BusManagement\frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### 5. Login
Open http://localhost:5173 and login with:
- **Username:** admin
- **Password:** admin123

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 Dashboard | Stats overview + Revenue & Booking charts |
| 🚌 Buses | Add/Edit/Delete buses (AC/Non-AC) |
| 🛣️ Routes | Manage bus routes with stops & schedules |
| 👨‍✈️ Drivers | Manage drivers, assign to buses |
| 🎫 Bookings | Book tickets, cancel bookings |
| 📅 Trips | Schedule and track trips |
| 💰 Fares | Set fares per route |
| 📊 Reports | Revenue, bookings & driver analytics |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Recharts, Axios
- **Backend:** Node.js, Express.js, bcryptjs, jsonwebtoken
- **Database:** MySQL 8+ (via mysql2)
