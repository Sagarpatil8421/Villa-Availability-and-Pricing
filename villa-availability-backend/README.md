## Villa Availability & Pricing – Backend API

Node.js backend service for searching available villas and generating pricing quotes based on nightly calendar data, following strict business rules around stay windows and GST.

---

## 🧱 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM / Query Builder**: Knex.js
- **Validation**: Joi
- **Date Handling**: dayjs
- **Config**: dotenv

---

## 📁 Folder Structure

High‑level structure (only backend, no frontend):

```text
src/
├── app.js                 # Express app (middleware, routes, error handling)
├── server.js              # Server bootstrap + DB connection check
│
├── config/
│   ├── db.js              # Shared Knex instance + connection verification
│   └── env.js             # Environment loading (PORT, NODE_ENV)
│
├── db/
│   ├── knexfile.js        # Knex configuration (PostgreSQL + migrations/seeds)
│   ├── migrations/
│   │   ├── 202501010001_create_villas.js
│   │   └── 202501010002_create_villa_calendar.js
│   └── seeds/
│       ├── 01_villas.js
│       └── 02_villa_calendar.js
│
├── routes/
│   └── villas.routes.js   # Route definitions for villa availability & quote
│
├── controller/
│   └── villas.controller.js  # HTTP controllers, request/response only
│
├── services/
│   └── villas.services.js    # Business logic (availability, pricing, GST)
│
├── repositories/
│   └── villas.repository.js  # Database queries (Knex/SQL aggregation)
│
├── validators/
│   └── villas.validator.js   # Joi schemas for query & param validation
│
├── middlewares/
│   └── error.middleware.js   # AppError + centralized error handler
│
├── constants/
│   └── gst.js                # GST_RATE constant (18%)
│
└── utils/
    ├── date.utils.js         # Date parsing, nights calc, DB date ranges
    └── pagination.utils.js   # Pagination helpers (page, limit, offset)
```

**Layering:**
- **Controllers**: HTTP only (validation → call services → send JSON).
- **Services**: Business rules & calculations (nights, subtotal, GST, totals).
- **Repositories**: Pure DB access and SQL aggregation via Knex.

---

## 🚀 Setup & Installation

### 1. Prerequisites

- Node.js (>= 18 recommended)
- PostgreSQL (>= 12)
- npm

### 2. Install dependencies

From the project root:

```bash
cd villa-availability-backend
npm install
```

### 3. Configure environment (.env)

Create a `.env` file in `villa-availability-backend/`:

```env
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=villa_db          # Or your chosen DB name
DB_USER=postgres          # Your DB user
DB_PASSWORD=your_password # Your DB password
```

Create the database in PostgreSQL (if not already created):

```sql
CREATE DATABASE villa_db;
```

### 4. Run database migrations

```bash
npm run migrate
```

This creates:

- `villas`
- `villa_calendar`

### 5. Seed sample data

```bash
npm run seed
```

This inserts:
- 50 sample villas with readable names and locations (Goa, Lonavala, Alibaug, Coorg).
- A per-day availability calendar for each villa from 2025-01-01 to 2025-12-31.
- Nightly rates randomized between INR 30,000–50,000.
- Availability randomized with ~75% availability.


### 6. Start the server

```bash
npm run dev   # development (nodemon)
# or
npm start     # production-style
```

Server will listen on: `http://localhost:4000` (or `PORT` from `.env`).

Health check: Returns a simple status response to verify the server is running.

```bash
curl http://localhost:4000/health
```

---

## 🧮 Business Rules

### Stay Window

- Stay window is **\[check_in, check_out)**.
- **`check_out` is NOT counted** as a night.
- `nights = difference in days` between `check_in` and `check_out`.
- Example:
  - `check_in = 2025-01-10`
  - `check_out = 2025-01-13`
  - `nights = 3` (10, 11, 12).

### Availability Rules

- A villa is **available** for a range **only if every night in the range is available**.
- If **any calendar date is missing** in `villa_calendar` for the requested range:
  - The villa is treated as **unavailable**.
- If any date exists but `is_available = false`:
  - The villa is **unavailable** for that range.

### Pricing & GST

- `subtotal = sum of nightly rates` over all nights in the stay.
- `GST_RATE = 18%` (from `constants/gst.js`).
- `gst = subtotal * 0.18` (rounded to integer in the implementation).
- `total = subtotal + gst`.
- `avg_price_per_night = subtotal / nights`.

---

## 📊 Database Schema

### Table: `villas`

- `id` (PK, integer, auto‑increment)
- `name` (string, not null)
- `location` (string, not null)
- `created_at` (timestamp with default)
- `updated_at` (timestamp with default)

### Table: `villa_calendar`

- `id` (PK, integer, auto‑increment)
- `villa_id` (FK → `villas.id`, on delete cascade)
- `date` (date, not null)
- `is_available` (boolean, default `true`, not null)
- `rate` (decimal(12,2), not null)
- `created_at` (timestamp with default)
- `updated_at` (timestamp with default)

Constraints:
- `UNIQUE (villa_id, date)`
- Index on `(villa_id, date)`

---

## 🔌 API Documentation

Base URL (development):

```text
http://localhost:4000
```

All routes are versioned under `/v1`.

---

### 1) List Available Villas

**Endpoint**

```http
GET /v1/villas/availability
```

**Query Parameters**

- `check_in` (required, `YYYY-MM-DD`)
- `check_out` (required, `YYYY-MM-DD`)
- `sort` (optional, only `avg_price_per_night`)
- `order` (optional, `asc` | `desc`)
- `page` (optional, integer ≥ 1, default handled server-side)
- `limit` (optional, integer ≥ 1, default handled server-side)

**Behavior**

- Validates inputs using **Joi**.
- Rejects invalid dates or where `check_out <= check_in` with **400**.
- Returns **only villas fully available** for the specified date range:
  - Every night in \[check_in, check_out) must be present and available.
  - Missing calendar rows → villa excluded.
- Computes:
  - `nights`
  - `subtotal` (sum of nightly rates)
  - `avg_price_per_night = subtotal / nights`
- **Pagination** is applied **after** availability filtering.
- **Sorting** is applied by `avg_price_per_night` (asc/desc) when requested.

**Response**

```json
{
  "meta": { "page": 1, "limit": 10, "total": 42 },
  "data": [
    {
      "id": 1,
      "name": "Villa X",
      "location": "Goa",
      "nights": 3,
      "subtotal": 120000,
      "avg_price_per_night": 40000
    }
  ]
}
```

**Example – cURL**

```bash
curl "http://localhost:4000/v1/villas/availability?check_in=2025-01-10&check_out=2025-01-13&page=1&limit=10&sort=avg_price_per_night&order=asc"
```

**Error Examples**

- Invalid date format:

```json
{
  "error": {
    "message": "Validation error: check_in must be in YYYY-MM-DD format"
  }
}
```

- `check_out` before `check_in`:

```json
{
  "error": {
    "message": "Validation error: check_out must be after check_in"
  }
}
```

---

### 2) Villa Quote

**Endpoint**

```http
GET /v1/villas/:villa_id/quote
```

**Path Parameters**

- `villa_id` (required, positive integer)

**Query Parameters**

- `check_in` (required, `YYYY-MM-DD`)
- `check_out` (required, `YYYY-MM-DD`)

**Behavior**

- Validates `villa_id` and date params (Joi + custom date-range logic).
- **404** if the villa does not exist.
- Fetches the **full nightly calendar rows** for the stay window \[check_in, check_out).
  - If **any date is missing** → `is_available = false`.
  - If all dates present but any `is_available = false` → `is_available = false`.
- Returns `nightly_breakdown` for all rows in the window.
- Computes:
  - `nights`
  - `subtotal`
  - `gst_rate` (0.18)
  - `gst`
  - `total`

**Response Example**

```json
{
  "villa": { "id": 1, "name": "Villa X", "location": "Goa" },
  "check_in": "2025-01-10",
  "check_out": "2025-01-13",
  "nights": 3,
  "is_available": true,
  "nightly_breakdown": [
    { "date": "2025-01-10", "rate": 35000, "is_available": true },
    { "date": "2025-01-11", "rate": 40000, "is_available": true },
    { "date": "2025-01-12", "rate": 45000, "is_available": true }
  ],
  "subtotal": 120000,
  "gst_rate": 0.18,
  "gst": 21600,
  "total": 141600
}
```

**Example – cURL**

```bash
curl "http://localhost:4000/v1/villas/1/quote?check_in=2025-01-10&check_out=2025-01-13"
```

**Error Examples**

- Villa not found:

```json
{
  "error": {
    "message": "Villa not found"
  }
}
```

- Invalid `villa_id`:

```json
{
  "error": {
    "message": "villa_id must be a positive integer"
  }
}
```

- Invalid dates:

```json
{
  "error": {
    "message": "Validation error: check_out must be after check_in"
  }
}
```

---

## ⚙️ Performance & Design Notes

- **SQL aggregation (no N+1 loops)**:
  - Availability computation is done using **aggregations in SQL** (`COUNT`, `SUM`, `BOOL_AND`, etc.) via Knex.
  - Villas are **not** processed villa‑by‑villa in JavaScript; filtering happens in the DB.
- **Pagination**:
  - Implemented server‑side.
  - Pagination is applied **after** availability filtering, which ensures `meta.total` reflects only fully-available villas.
- **Indexes**:
  - Index on `(villa_id, date)` in `villa_calendar` speeds up range queries.
- **Layered architecture**:
  - Separates controllers, services, repositories for testability and maintainability.
- **Centralized error handling**:
  - All errors funnel through a single middleware for consistent JSON error responses.

---

## ✅ Known Assumptions

- All date inputs are expected in **`YYYY-MM-DD`** and treated as **local dates**, not timezone-aware instants.
- GST is a **flat 18%** on the subtotal and does not vary by villa or location.
- Currency is assumed to be a single unit (e.g. INR); no multi-currency handling is implemented.
- No authentication/authorization is implemented; all APIs are public for the scope of this assignment.
- Concurrency control (e.g., preventing double bookings) is **out of scope**; this service is read‑oriented for availability and quotes.
- Only the described endpoints (`/v1/villas/availability`, `/v1/villas/:villa_id/quote`) are implemented; no admin CRUD endpoints are provided.

---

## 🧪 Testing Tips

- Use Postman, Insomnia, or curl to hit the endpoints.
- Vary `check_in` / `check_out` to test:
  - Valid vs invalid date formats.
  - `check_out` <= `check_in`.
  - Date ranges partially outside the seeded calendar window.



