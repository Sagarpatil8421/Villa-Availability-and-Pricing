## Villa Availability & Pricing – Flutter App

Flutter client for the **Villa Availability & Pricing** system.  
This app consumes a pre-built Node.js backend to list available villas for a date range and show a detailed price quote for a selected villa.

---

## 🧱 Tech Stack

- **Framework**: Flutter (Dart)
- **State Management**: `provider`
- **HTTP Client**: `http`
- **Formatting**: `intl` (dates & currency)
- **Target Platform for Demo**: Flutter Web (Chrome)

---

## 🔗 Backend Dependency

This app **does not** include the backend. It expects the Node.js API to be running separately.

- Backend base URL: `http://localhost:4000`
- Required endpoints (already implemented in backend):
  - `GET /v1/villas/availability`
  - `GET /v1/villas/{villa_id}/quote`

Make sure you can hit these endpoints (e.g. via Postman) **before** running the Flutter app.

---

## 🚀 Running the App (Flutter Web)

### 1. Prerequisites

- Flutter SDK installed (`flutter doctor` is clean)
- Chrome (or another supported web browser)
- Backend server running locally on `http://localhost:4000`

### 2. Install dependencies

```bash
cd villa_availability_app
flutter pub get
```

### 3. Run in Chrome (web)

```bash
flutter run -d chrome
```

This will open the app in your browser at a local development URL (served by Flutter).

> Note: The app assumes CORS is allowed from `http://localhost:*` to the backend. If needed, enable CORS in the backend (already set up in the Node.js project).

---

## 📁 Folder Structure (lib/)

```text
lib/
├── main.dart                 # App entry, Provider + MaterialApp
│
├── config/
│   └── app_config.dart       # API base URL
│
├── models/
│   ├── villa.dart            # Villa list item model
│   └── villa_quote.dart      # Villa quote + nightly breakdown models
│
├── services/
│   └── api_service.dart      # HTTP calls to availability & quote endpoints
│
├── providers/
│   └── villa_provider.dart   # State for villa list + quote
│
├── screens/
│   ├── villa_list_screen.dart   # List of available villas
│   └── villa_detail_screen.dart # Quote details for a selected villa
│
├── widgets/
│   ├── villa_card.dart       # Card UI for a villa in the list
│   ├── search_summary.dart   # Summary of results + date range
│   └── filter_sort_bar.dart  # UI-only filter/sort bar (placeholders)
│
└── utils/
    └── date_utils.dart       # Display formatting for dates & ranges
```

---

## 📱 Screens Implemented

### 1. Villa List Screen (`VillaListScreen`)

- Calls `GET /v1/villas/availability` with a **fixed date range**:
  - `check_in = "2025-01-10"`
  - `check_out = "2025-01-13"`
- Uses `VillaProvider` to:
  - Load available villas
  - Expose loading, error, and data states
- UI behavior:
  - **Loading** → centered `CircularProgressIndicator`
  - **Error** → friendly error text
  - **Empty** → “No villas available”
  - **Success** → list of cards, each showing:
    - Name
    - Location
    - Nights
    - Average price per night
    - Subtotal (total for stay)
- Tapping a villa card navigates to the **Villa Detail (Quote)** screen, passing:
  - `villaId`
  - `checkIn`
  - `checkOut`

### 2. Villa Detail / Quote Screen (`VillaDetailScreen`)

- Accepts `villaId`, `checkIn`, `checkOut` as constructor arguments.
- Calls `GET /v1/villas/{villa_id}/quote` via `ApiService` and `VillaProvider`.
- Displays:
  - **Stay Details**:
    - Villa name & location
    - Date range
    - Nights
    - Availability status (Available / Unavailable)
    - If `is_available == false`, a clear message indicating unavailability.
  - **Nightly Breakdown**:
    - List of nightly rows with `date`, `rate`, and “Unavailable” label where applicable.
  - **Price Summary**:
    - Subtotal
    - GST (18%)
    - Total
- UI states:
  - **Loading** → centered spinner
  - **Error** → friendly error panel with icon + message
  - **Success but null data** → “No quote data available”

---

## ✅ Assumptions & Scope Limits

- The backend is **trusted and stable**; the app does not retry or debounce requests.
- Date range is **hardcoded** in this implementation for simplicity (`2025-12-15` to `2025-12-17`).
- There is **no authentication** and no user profiles.
- There is **no booking or payment** flow; the quote screen is read-only and informational.
- Filter and sort controls are **UI placeholders only** and do not alter API calls.
- The app targets a single currency (e.g. INR) and does not implement localization or multi-currency logic beyond simple formatting.
- Only two main flows are implemented:
  - Villa availability listing
  - Villa detail quote display

