# Amrutam Ayurvedic Super App - Senior React Native Assignment

Production-ready Ayurvedic Super App built with **React Native**, **TypeScript**, **React Native Web**, and a senior modular architecture. The application comfortably handles large datasets (**5,000 Doctors**, **20,000 Shop Products**, and **10,000 Health Records**) with sub-5ms filtering and 60fps virtualized rendering.

---

## 🌟 Key Architecture & Features

### 1. Modules
- **Module 1 – Consultations:**
  - Virtualized listing of 5,000 doctors.
  - Search by name/specialty/location and multi-filtering (experience, ratings, availability today).
  - Slot Picker Matrix with conflict detection, expired slot prevention, and double-booking protection.
  - Consultation booking flow with offline queueing.
  - Upcoming Consultations modal with cancellation workflow.

- **Module 2 – Shop:**
  - Virtualized infinite scroll grid of 20,000 products.
  - Multi-filtering by category and dosage form with price & rating sorting options.
  - Product details modal with herbal benefits breakdown.
  - Persistent cart with quantity updates, subtotal, 10% Ayurvedic discount calculation, and local storage persistence.
  - Wishlist drawer with 1-click move to cart capability.
  - Checkout Summary & order placement engine.

- **Module 3 – Health Records:**
  - Patient timeline of 10,000 health records.
  - Categorized by **Lab Report**, **Prescription**, **Consultation**, **Vaccination**, and **Allergy**.
  - Tag search (e.g. `#ayurveda`, `#prakriti`, `#bloodtest`).
  - Attachment Viewer Modal with support for image previews and digital PDF clinical report view.

### 2. Performance Challenge Solutions
- **Deterministic Dataset Generator:** Memory-efficient pre-indexed dataset generation producing 35,000 total items.
- **Virtualized Rendering:** Custom `VirtualizedGrid` leveraging React Native `FlatList` windowing, clipped subviews removal, and key extraction.
- **Memoization:** Extensive use of `useMemo` and `useCallback` to preserve filter computations across render cycles.

### 3. Offline-First & Reliability Engine
- **Cached API Responses:** `ApiClient` caches responses for instant offline fallback.
- **Offline Action Queue:** Queues booking attempts, cart changes, and order placements when disconnected.
- **Automatic Sync:** Sync engine automatically flushes and processes queued actions upon network restoration.
- **Reliability Simulation (Dev Control Deck):**
  - Offline Mode toggle.
  - Slow 3G network simulation (1,800ms latency).
  - API Chaos mode (simulates 500 internal server errors, invalid JSON, and partial responses).
  - Session expiration simulation (401 Unauthorized).

### 4. Production Engineering & DX
- **Theme & Dark Mode:** Light/Dark theme engine with Amrutam Ayurvedic color tokens (Forest Green `#3A643B`, Soft Cream `#FFF7ED`, Warm Amber `#E07A5F`).
- **Responsive Layout:** Dynamic UI adapting across **Mobile (<600px)**, **Tablet (600-1024px)**, and **Desktop (>1024px)** with multi-column grids.
- **Localization (i18n):** Complete dictionary support for English (`en`) and Hindi (`hi`).
- **Telemetry & Crash Reporting:** Abstraction logging utility for tracking execution traces and UI runtime errors.
- **Global Toast Manager:** Animated alert banners for network events, queue updates, and errors.
- **Error Boundary:** Top-level error boundary with graceful fallback UI.

---

## 📁 Directory Structure

```
AmrutamAssignment/
├── index.html                   # Web application entry template
├── index.web.tsx                # Web mounting point (React Native Web)
├── index.js                     # React Native native entry point
├── App.tsx                      # Main App wrapper & Error Boundary
├── vite.config.js               # Web bundler configuration
├── src/
│   ├── core/
│   │   ├── api/                 # ApiClient, Caching, Chaos & Timeout handlers
│   │   ├── config/              # Environment config & feature flags
│   │   ├── i18n/                # English & Hindi translation dictionaries
│   │   ├── logger/              # Logger & Crash reporting abstraction
│   │   └── offline/             # Offline queue manager & auto-sync engine
│   ├── data/
│   │   └── mockGenerator.ts     # Data generators (5k Doctors, 20k Products, 10k Records)
│   ├── theme/
│   │   ├── theme.ts             # Light & Dark color tokens & responsive breakpoints
│   │   └── ThemeContext.tsx     # Theme context provider
│   ├── store/
│   │   └── AppContext.tsx       # Global state store for Consultations, Shop, Cart, Records & Controls
│   ├── components/
│   │   ├── Header.tsx           # Responsive navigation header bar
│   │   ├── DevControlDeck.tsx   # Interactive floating panel for reliability & offline testing
│   │   ├── GlobalToast.tsx      # Global notification toast container
│   │   ├── ErrorBoundary.tsx    # React error boundary component
│   │   ├── VirtualizedGrid.tsx  # Optimized virtualized grid component
│   │   └── AttachmentViewerModal.tsx # Preview modal for images & PDF thumbnails
│   └── modules/
│       ├── consultations/       # Doctor Listing, Slot Picker & Booking Flow
│       ├── shop/                # Product Grid, Cart Drawer, Wishlist & Checkout
│       └── health_records/      # Patient Timeline, Record Types & Tag Filtering
└── __tests__/                   # Jest unit & hook tests
```

---

## 🧪 Testing

Run automated unit tests for business logic, slot validation, cart calculation, and API reliability:

```bash
# Run Jest tests
npm test
```

---

## 🚀 Running the Web Application

The project is configured for instant browser previewing using React Native Web:

```bash
# Start Web Development Server
npm run web
```

Open browser at `http://localhost:3000`.

---

## 💡 Trade-Offs & Future Enhancements

1. **State Persistence:** Currently utilizes `localStorage` / `AsyncStorage` abstraction. In a large enterprise app, SQLite / WatermelonDB can be integrated for full offline database querying.
2. **Audio/Video Tele-consultations:** WebRTC signaling abstraction can be added to launch direct video calls from the consultation screen.
