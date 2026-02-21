## FleetFlow – Fleet Management Command Center

FleetFlow is a full‑stack fleet management prototype built for learning and experimentation.  
It simulates a modern SaaS command center for logistics teams, with role‑based access, real‑time fleet state, and MySQL‑backed persistence.

The project is split into:
- `frontend/` – React + Vite single‑page application (SPA)
- `backend/` – Node.js + Express API with MySQL

---

### Features Overview

- **Authentication**
  - Email + password login
  - Simple registration with role selection:
    - Fleet Manager
    - Dispatcher
    - Safety Officer
    - Financial Analyst
  - Demo seeded user:
    - Email: `fleet.manager@company.com`
    - Password: `password`

- **Role‑Based Access Control**
  - Fleet Manager: full access to all modules
  - Dispatcher: Dashboard, Vehicles, Dispatch
  - Safety Officer: Dashboard, Vehicles, Drivers
  - Financial Analyst: Dashboard, Vehicles, Analytics
  - Both sidebar navigation and main content respect role permissions

- **Dashboard (Command Center)**
  - KPI cards:
    - Active Fleet (On Trip)
    - Maintenance Alerts (In Shop)
    - Utilization Rate (%)
    - Pending Cargo (Dispatched trips)
  - Animated truck hero in header for a more “live” SaaS feel

- **Vehicle Registry**
  - Table of all vehicles:
    - Plate, Model, Capacity, Odometer, Status
  - Status badges:
    - Available
    - On Trip
    - In Shop
  - “Mark In Shop / Set Available” action
  - “Add Vehicle” modal form

- **Trip Dispatcher**
  - Dispatch form:
    - Select vehicle (only Available)
    - Select driver (only Available)
    - Cargo weight, Expected revenue
  - Validations enforced on backend:
    - Block if cargo > vehicle maxLoad
    - Block if driver license status is expired
    - Block if vehicle not Available
  - When trip dispatched:
    - Trip status → `Dispatched`
    - Vehicle status → `On Trip`
    - Driver status → `On Duty`
  - When trip completed:
    - Trip status → `Completed`
    - Vehicle status → `Available` (unless kept In Shop)
    - Driver status → `Available`

- **Maintenance**
  - Log maintenance for a vehicle:
    - Date, description, cost
  - Automatically sets vehicle status to `In Shop`
  - Table showing all maintenance logs

- **Drivers & Safety**
  - Table of drivers:
    - Name
    - License status (Valid / Expired)
    - Duty status (Available / On Duty)
    - Safety score
  - Expired licenses highlighted via red badge

- **Analytics & Finance**
  - Fuel expenses capture:
    - Vehicle, Fuel liters, Fuel cost
  - Derived metrics:
    - Total odometer
    - Total fuel captured
    - Approximate fuel efficiency
  - Simple per‑vehicle ROI‑style table:
    - Revenue, maintenance, fuel costs, acquisition cost, ROI%
  - CSV export (based on in‑memory state on the client)

---

### Tech Stack

- **Frontend**
  - React 18
  - Vite
  - `lucide-react` for icons
  - Custom CSS (no CSS framework), designed as a light, airy SaaS UI with micro‑animations

- **Backend**
  - Node.js + Express
  - `mysql2` (promise API)
  - `dotenv` for environment configuration
  - `cors` for local development

- **Database**
  - MySQL (tested with a local instance)
  - Database name: `fleetflow` (configurable via `.env`)

---

### Project Structure

```text
Odoo-Try/
  backend/
    index.js           # Express server + MySQL integration
    package.json       # Backend dependencies and scripts
    .env               # Database configuration (not committed)

  frontend/
    src/
      components/
        layout/        # AppShell, Sidebar
        dashboard/     # Dashboard
        vehicles/      # VehicleRegistry
        trips/         # TripDispatcher
        maintenance/   # MaintenanceLogs
        drivers/       # DriverPerformance
        analytics/     # AnalyticsFinance
      context/
        FleetContext.jsx  # Global fleet state & API calls
      App.jsx
      main.jsx
      style.css        # Global styles and animations
    public/
      truck.gif        # Animated truck shown on dashboard
    package.json
    vite.config.mjs
```

---

### Backend: Setup and Configuration

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Configure database connection**

Create `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=fleetflow
```

3. **Ensure MySQL database exists**

Connect to MySQL and create the database:

```sql
CREATE DATABASE fleetflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

4. **Start backend**

```bash
cd backend
npm run start
```

On first run the server will:
- Connect to `fleetflow` database
- Create tables if they do not exist:
  - `users`
  - `vehicles`
  - `drivers`
  - `trips`
  - `maintenances`
  - `expenses`
- Seed a demo Fleet Manager user and a few example vehicles/drivers

If you prefer auto‑reload during development:

```bash
npm run dev
```

---

### Frontend: Setup and Run

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Run in development mode**

```bash
npm run dev
```

By default Vite serves on `http://localhost:5173`.  
Open this in your browser after the backend is running.

3. **Build for production**

```bash
npm run build
```

4. **Preview production build**

```bash
npm run preview
```

---

### How Frontend and Backend Talk

- The frontend uses `fetch` calls inside `FleetContext.jsx` to talk to the backend.
- Endpoints include (non‑exhaustive):
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/state`
  - `POST /api/vehicles`
  - `POST /api/vehicles/:id/toggle-shop`
  - `POST /api/trips`
  - `POST /api/trips/:id/complete`
  - `POST /api/maintenances`
  - `POST /api/expenses`
- The API responses update the React context, which re‑renders all modules.

---

### Business Rules Summary

- Trips:
  - Cannot dispatch if:
    - Cargo weight exceeds vehicle `maxLoad`
    - Driver license status is expired
    - Vehicle is not `Available`
  - Dispatching updates:
    - Trip → `Dispatched`
    - Vehicle → `On Trip`
    - Driver → `On Duty`
  - Completing updates:
    - Trip → `Completed`
    - Vehicle → `Available` (or stays `In Shop` if required)
    - Driver → `Available`

- Maintenance:
  - Logging maintenance for a vehicle:
    - Inserts a row into `maintenances`
    - Sets vehicle status to `In Shop`

- Expenses / Analytics:
  - Fuel entries are stored in `expenses`
  - Frontend computes simple metrics and ROI‑style numbers from backend state

---

### UI / UX Notes

- Light theme with:
  - Off‑white gradient background
  - White cards with soft shadows
  - Rounded corners and ample spacing
- Micro‑interactions:
  - Smooth transitions on buttons, cards, and navigation (`0.3s` cubic‑bezier easing)
  - Hover lift on cards and buttons
  - Glow ring on input focus
  - Animated page transitions when switching modules (fade + slide up)
  - Animated truck GIF driving across a pill‑shaped “road” on Dashboard
- Responsive:
  - Layout collapses gracefully on smaller screens
  - Side panels stack vertically on mobile

---

### Known Limitations / Notes

- Authentication uses plain‑text passwords for simplicity; do not use in production.
- There is no multi‑tenant or advanced permission system; roles are basic.
- MySQL connection assumes a local database; tweak `.env` for remote setups.
- Error handling is intentionally minimal and optimized for learning.

---

### Next Ideas

- Add proper password hashing and session/token authentication
- Enhance analytics with charts (e.g., using a small charting library)
- Add pagination and filtering for large fleets
- Add audit logs for dispatch and maintenance actions

