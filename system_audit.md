# Cainta Photography Studio MIS - System Audit Report
**Date:** August 14, 2026
**Audited System URL:** `https://ais-dev-vdk6kujwwldhifu64ctifp-39188197421.asia-southeast1.run.app`

---

## 1. System Inventory
The project follows a standard full-stack React + Express architecture. Code is stored in TypeScript modules, with CSS styling driven by Tailwind CSS and client animations running on Framer Motion (`motion/react`).

### Workspace File & Folder Hierarchy
```
/
├── .env.example                     # Declaration of required server environmental parameters
├── .gitignore                       # Node and system level ignores (protects dev outputs)
├── bun.lock                         # Lockfile for package resolving
├── index.html                       # Frontend HTML container & entry point mounting src/main.tsx
├── metadata.json                    # Application name, description, capabilities and permissions
├── package.json                     # NPM dependency and package run script declarations
├── db.json                          # JSON database file (generated automatically on server start)
├── server.ts                        # Main Express web-server, API endpoint routers & Gemini proxy
├── tsconfig.json                    # Compiler config enforcing strict typings and ES6 resolution
├── vite.config.ts                   # Bundler configuration mounting React and Tailwind plugins
└── src/
    ├── main.tsx                     # Entry point for React DOM bootstrapping
    ├── index.css                    # Global styling imports (@import "tailwindcss")
    ├── App.tsx                      # Central React router, session manager, and API syncer
    ├── types.ts                     # Domain TypeScript interface structures and UserRole enum
    ├── components/
    │   ├── BookingWizard.tsx        # Multi-step checkout form with double-booking slot validation
    │   ├── CaintaStudioMap.tsx      # OpenStreetMap (Leaflet) geo-marker visualizer for studio hubs
    │   ├── Chatbot.tsx              # Sidebar widget feeding Gemini with localized knowledge bases
    │   ├── ClientGallery.tsx        # Proofing portal grid enabling star-marking and feedback notes
    │   ├── MotionCard.tsx           # Framer Motion wrapper for premium physical card entry triggers
    │   ├── Navbar.tsx               # Responsive menu panel adapting to role permissions
    │   ├── NotificationCenter.tsx   # Floating status logger pushing instant alerts to sessions
    │   ├── PrintOrderWizard.tsx     # Photo uploader, cropper simulation, and shipping destination calculator
    │   └── SystemCalendar.tsx       # Scheduler render with month/week planner for workload mapping
    ├── pages/
    │   ├── LandingPage.tsx          # Client exploration center with promotions and service categories
    │   ├── Login.tsx                # Secure session gateway with registration forms
    │   ├── StudioDirectory.tsx      # Catalog page with search, categories, map-triggers, and rating filters
    │   ├── StudioProfile.tsx        # Detailed studio listing featuring reviews, packages, services, and map
    │   ├── CustomerDashboard.tsx    # Customer portal hosting favorite hubs, print queue, and bookings
    │   ├── StudioDashboard.tsx      # Studio Owner's analytical control tower, ledger, and settings
    │   └── AdminDashboard.tsx       # Platform Super Admin registry, system audits, and verified badges
    └── utils/
        ├── calendarSync.ts          # ICS file generator for external Apple/Google calendar integration
        └── pdfGenerator.ts          # Client-side PDF generation engine (official receipts & analytics)
```

---

## 2. Requirements Matrix
Below is a systematic mapping of required system features to their exact technical implementation in the codebase:

| Feature Name | Primary Front-End Files | Primary Back-End Files | Key Implementation Mechanics |
| :--- | :--- | :--- | :--- |
| **User Authentication & RBAC** | `/src/pages/Login.tsx` | `/server.ts` | Plaintext fallback & `bcryptjs` encryption. Role verification via Express context. Session sync on page reload in React. |
| **Studio Directory & Maps** | `/src/pages/StudioDirectory.tsx`, `/src/components/CaintaStudioMap.tsx` | `/server.ts` (`GET /api/studios`) | Renders `leaflet` interactive maps on React container. Dynamic filters for search matching, rating ranges, and services. |
| **Multi-Step Booking Wizard** | `/src/components/BookingWizard.tsx` | `/server.ts` (`POST /api/bookings`) | Tracks state steps for choosing Service, Package, Block Time, Add-ons, Notes, andGCash/Receipt upload. |
| **Anti Double-Booking Validation** | `/src/components/BookingWizard.tsx` | `/server.ts` (double-booking validation hooks) | Computes existing slot intervals matching Date. Compares `parseTimeToMinutes` start & durations to isolate overlaps. |
| **Downpayment Verification** | `/src/pages/StudioDashboard.tsx` | `/server.ts` (`PUT /api/payments/:id/status`) | Studio Owner audits uploaded receipt attachments & updates status to `Verified` or `Rejected` on the ledger table. |
| **Official PDF Receipts** | `/src/utils/pdfGenerator.ts` | Client-Side generation | Leverages `jspdf` to compile vector matrices containing booking invoice data, logo vectors, and barcode grids. |
| **Print-Shop Orders** | `/src/components/PrintOrderWizard.tsx` | `/server.ts` (`POST /api/print-orders`) | Base64 file stream loader with dimension selectors, automatic delivery-rate computation, and receipt proofs. |
| **Interactive Workload Calendar** | `/src/components/SystemCalendar.tsx` | `/server.ts` (`GET /api/bookings`) | Tailored React grid showing appointment cards, client phone numbers, and direct proofing upload options. |
| **Client Photo-Proofing Portal** | `/src/components/ClientGallery.tsx`, `/src/pages/CustomerDashboard.tsx` | `/server.ts` (`PUT /api/photo-proofings/:id`) | Watermarked grid allowing star selection, status tagging (`raw`, `editing`, `approved`), and client-to-studio notes. |
| **Revenue Trend Dashboard** | `/src/pages/StudioDashboard.tsx` | `/server.ts` (computes live aggregation values) | Renders multi-view Recharts plots (composed, stacked bar, area) tracking sales trends over 6 rolling months. |
| **FAQS AI Chatbot** | `/src/components/Chatbot.tsx` | `/server.ts` (`POST /api/chatbot`) | Leverages `@google/genai` with a heavily restricted system instructions file restricting Gemini to local database parameters. |
| **Super Admin Dashboard** | `/src/pages/AdminDashboard.tsx` | `/server.ts` (`PUT /api/studios/:id/approve`) | Admin controls, verified hub badges, announcements management, and live activity audit streams. |

---

## 3. User Role Matrix
The platform enforces role-based access control (RBAC) across four tiers, which are validated both on the front-end router and via backend endpoints:

| Role Name | Scope Description | Dashboard Location | Unique Actions & Permissions |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | Platform owner, auditor, and verifier of local business hubs. | `/src/pages/AdminDashboard.tsx` | • Approve/Decline new Studio applications<br>• Create system-wide Announcements<br>• View platform-wide Audit Logs<br>• Edit system categories |
| **STUDIO_ADMIN** | Studio Owner who manages catalog listings, staff, and bookings. | `/src/pages/StudioDashboard.tsx` | • Modify Studio Profile details (address, contact, hours)<br>• Review and verify payment receipts<br>• Accept/Decline/Reschedule appointments<br>• Upload photo proofing collections<br>• View live financial analytics |
| **STUDIO_STAFF** | Assigned operator managing appointments and fulfillment. | Shared with Admin | • Perform photography shoot fulfillment<br>• Process print-shop orders<br>• View workload calendar planner |
| **CUSTOMER** | End-user (students, families, local residents). | `/src/pages/CustomerDashboard.tsx` | • Book appointments & order customized prints<br>• Favorite studios and post reviews<br>• Submit payment transactions & receipts<br>• Star and review watermarked proofs |

---

## 4. CRUD Matrix

The platform models business operations across twelve structured entities. The CRUD operations permitted for each are mapped below:

| Entity Name | C | R | U | D | Creator (C) | Reader (R) | Updater (U) | Deleter (D) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **Users** | Yes | Yes | Yes | Yes | Guest (Register) | Self, Super Admin | Self, Super Admin | Super Admin |
| **Studios** | Yes | Yes | Yes | Yes | Super Admin, Guest (Apply) | All Visitors | Studio Admin, Super Admin | Super Admin |
| **Categories** | Yes | Yes | Yes | Yes | Super Admin | All Visitors | Super Admin | Super Admin |
| **Services** | Yes | Yes | Yes | Yes | Studio Admin | All Visitors | Studio Admin | Studio Admin |
| **Packages** | Yes | Yes | Yes | Yes | Studio Admin | All Visitors | Studio Admin | Studio Admin |
| **Add-ons** | Yes | Yes | Yes | Yes | Studio Admin | All Visitors | Studio Admin | Studio Admin |
| **Bookings** | Yes | Yes | Yes | Yes | Customer | Customer, Studio Admin | Customer, Studio Admin | Studio Admin, Super Admin |
| **Payments** | Yes | Yes | Yes | No | Customer | Customer, Studio Admin | Studio Admin | Forbidden (Immutable ledger) |
| **Print Products** | Yes | Yes | Yes | Yes | Studio Admin | All Visitors | Studio Admin | Studio Admin |
| **Print Orders** | Yes | Yes | Yes | Yes | Customer | Customer, Studio Admin | Studio Admin | Customer (Only if Pending) |
| **Reviews** | Yes | Yes | Yes | Yes | Customer | All Visitors | Customer | Super Admin |
| **Chatbot FAQs** | Yes | Yes | Yes | Yes | Studio Admin, Super Admin | All Visitors | Studio Admin, Super Admin | Studio Admin, Super Admin |
| **Audit Logs** | Yes | Yes | No | No | System Hook | Super Admin | Forbidden | Forbidden |
| **Notifications**| Yes | Yes | Yes | No | System Hook | Target User | Target User (Mark read) | Forbidden |

---

## 5. Database Audit
The platform utilizes a customized JSON-based single-file database (`db.json`) parsed and saved by `/src/db/database.ts` via synchronous `fs` methods. 

### Core Schema & Types
- **Persistence Engine:** `JSONDatabase` class holds an in-memory `DatabaseSchema` object matching `db.json`. Any mutation triggers an immediate `save()` (wrapping `fs.writeFileSync`).
- **Initial Seed Data:** Fully automated on boot if `db.json` is missing. Seeds 5 users (1 Super Admin, 3 Studio Admins, 1 Customer), 7 categories, 5 local Cainta studios (Lumina, Aperture, Apex, Memory Lens, ShutterCraft), 4 corporate services, 4 packages, 4 addons, 6 historic bookings, 5 payments, 3 print products, 3 print orders, 3 reviews, 6 FAQs, 3 audit logs, and 2 user notifications.

### Potential Concurrency and Performance Risks
1. **Thread Blocking via Synchronous I/O:** Every CRUD write executes `fs.writeFileSync()` synchronously on the Node.js event loop. Under concurrent user traffic, this will block execution threads, leading to slow request responses.
2. **State Corruption & Race Conditions:** Two concurrent write requests can load, mutate, and overwrite the file simultaneously, causing one update to erase the other.
3. **No ACID Guarantee:** Unlike SQL databases, there are no transaction isolation scopes. If the server crashes mid-write, `db.json` can be corrupted, deleting the entire database.

---

## 6. API Audit
All REST API routes are registered inside `/server.ts` and prefixed with `/api`.

### Endpoints Directory

| Method | Path | Payload Schema | Success Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | `{ email, password }` | `{ success: true, user }` | Authenticates email, validates passwords, and returns user details. |
| **POST** | `/api/auth/register` | `{ email, password, fullName, role, ... }` | `{ success: true, user }` | Registers a new client profile. Enforces bcrypt encryption. |
| **GET** | `/api/studios` | None (Optional queries) | `{ success: true, studios }` | Returns all registered studios with rating aggregates. |
| **GET** | `/api/studios/:id` | None | `{ success: true, studio }` | Fetches a single studio profile. |
| **POST** | `/api/studios` | `Partial<Studio>` | `{ success: true, studio }` | Allows super admin to register or operator to apply. |
| **PUT** | `/api/studios/:id` | `Partial<Studio>` | `{ success: true, studio }` | Updates studio cover photo, address, price tags, or coordinates. |
| **PUT** | `/api/studios/:id/approve` | None | `{ success: true, studio }` | Super Admin verification toggle to approve a local studio hub. |
| **GET** | `/api/bookings` | `?studioId=X` or `?customerId=Y` | `{ success: true, bookings }` | Returns filtered appointments for calendar grids or client histories. |
| **POST** | `/api/bookings` | `{ studioId, customerId, serviceId, ... }`| `{ success: true, booking }` | Books a slot. Evaluates anti-double booking conflicts. |
| **PUT** | `/api/bookings/:id/status` | `{ status }` | `{ success: true, booking }` | Confirms, completes, cancels, or reschedules bookings. |
| **PUT** | `/api/bookings/:id/requirements`| `{ fileName }` | `{ success: true, booking }` | Uploads requirements (PDF, custom clothing profiles, background specs). |
| **GET** | `/api/payments` | `?studioId=X` or `?customerId=Y` | `{ success: true, payments }` | Returns payment records. |
| **POST** | `/api/payments` | `{ bookingId, amount, paymentMethod, ... }`| `{ success: true, payment }` | Registers a downpayment slip with GCash transaction ID. |
| **PUT** | `/api/payments/:id/status` | `{ status }` | `{ success: true, payment }` | Verified toggle by Studio Admin. Syncs booking status to "Confirmed". |
| **GET** | `/api/print-orders` | `?studioId=X` or `?customerId=Y` | `{ success: true, orders }` | Lists print orders. |
| **POST** | `/api/print-orders` | `{ productId, uploadedPhoto, ... }` | `{ success: true, order }` | Submits print instructions, destination shipping, and payment ref. |
| **PUT** | `/api/print-orders/:id/status` | `{ status }` | `{ success: true, order }` | Updates print status (Pending -> Processing -> Ready -> Completed). |
| **GET** | `/api/photo-proofings` | `?bookingId=X` | `{ success: true, proofings }`| Pulls proofing galleries for active reviews. |
| **POST** | `/api/photo-proofings` | `{ bookingId, photos, watermarkText }` | `{ success: true, proofing }` | Studio uploads watermarked shoot proofs for client selection. |
| **PUT** | `/api/photo-proofings/:id` | `{ photos, status }` | `{ success: true, proofing }` | Client highlights favorites, stars items, and adds retouch requests. |
| **GET** | `/api/audit-logs` | None | `{ success: true, auditLogs }` | Super Admin logs stream. |
| **POST** | `/api/chatbot` | `{ message, studioId, history }` | `{ success: true, text }` | Gemini integration route using vectorless db constraints. |

---

## 7. Page / Component Audit
The client application is built strictly as a Single Page App (SPA) driven by local state page switching (`currentPage` in `App.tsx`). This structure avoids page flash, maintains state, and simplifies transitions.

### Component Dependency Tree
```
App.tsx (Root State and Routing)
├── Navbar.tsx (Navigation & User Header Bar)
├── NotificationCenter.tsx (Alert Logger)
├── Chatbot.tsx (Gemini Support Drawer)
└── Page Views:
    ├── LandingPage.tsx (Promo banners, Leaflet maps, categories grid)
    ├── StudioDirectory.tsx (Search panel, rating slider, category toggle, interactive maps)
    │   └── CaintaStudioMap.tsx (Leaflet engine displaying coordinate nodes)
    ├── StudioProfile.tsx (Catalog listings, packages, services lists)
    │   └── BookingWizard.tsx (Multi-step booking engine)
    ├── CustomerDashboard.tsx (User profile, history tables, favorites)
    │   ├── PrintOrderWizard.tsx (Base64 crop selector, calculator)
    │   └── ClientGallery.tsx (Watermarked client selection panel)
    ├── StudioDashboard.tsx (Dashboard charts, ledger lists, settings forms)
    │   ├── SystemCalendar.tsx (Monthly calendar scheduler UI)
    │   └── ClientGallery.tsx (Watermarked admin-side proofing manager)
    └── AdminDashboard.tsx (Announcement creator, verified toggles, logs)
```

---

## 8. Security Audit
Below are critical findings on the application's overall security posture:

### Vulnerability Assessments
1. **Password Encryption Integrity:**
   - **Mechanism:** Password fields are secured using modern `bcryptjs` hashing with 10 salt rounds during normal user registrations.
   - **Vulnerability:** Legacy seed accounts in `/src/db/database.ts` have their passwords saved as raw strings (e.g., `admin123`, `lumina123`). The authentication endpoint in `server.ts` implements a plaintext-fallback check: `password === user.passwordHash`. This is a security risk if `db.json` is accessed.
2. **Client-Side Authorization Vulnerabilities (RBAC Bypass):**
   - **Mechanism:** Page routing in React is controlled by setting a state variable: `currentPage`.
   - **Vulnerability:** While page navigation blocks unauthorized roles, any user can mock client state in their browser to bypass layout limits. Back-end endpoints must validate the requester's role by checking headers or tokens. Currently, backend endpoints (e.g., `/api/audit-logs` or `/api/studios/:id/approve`) trust incoming requests without validating whether the active requester belongs to the admin role.
3. **Information Disclosure (Data Leakage):**
   - **Vulnerability:** Endpoints such as `/api/bookings` or `/api/payments` return the full list of records when requested without filters. A customer could inspect network payloads to view bookings or payment data belonging to other users.

---

## 9. Workflow Audit
A workflow inspection was conducted across the booking, payment, and print product lifecycles:

### 1. Booking State Machine
```
[Customer Books Slot] ──> Status: Pending (Unpaid)
                              │
                    (Payment Receipt Uploaded)
                              │
                              ▼
                       Pending Verification
                              │
                  (Studio Admin Verifies Receipt)
                              │
                              ▼
                           Confirmed (Status: Confirmed)
                              │
                   (Photoshoot Fulfill Event)
                              │
                              ▼
                           Completed
```
- **Double Booking Interlocking:** The booking wizard performs real-time checks on the client-side. The Express backend validates selected timeslots again before persisting records to prevent dual-booking conflicts.

### 2. Print Shop Order Pipeline
```
[Client Chooses Proof/Photo] ──> [Upload to Print Wizard] ──> Status: Pending
                                                                  │
                                                        (Studio Admin Accepts)
                                                                  │
                                                                  ▼
                                                              Processing
                                                                  │
                                                         (Printing Finished)
                                                                  │
                                                                  ▼
                                                           Ready for Pickup
                                                                  │
                                                        (Fulfillment Complete)
                                                                  │
                                                                  ▼
                                                              Completed
```
- **Shipping Rates Logic:** Automatically computes delivery costs for Cainta suburbs and standard local delivery zones.

### 3. Vectorless Chatbot Grounding (Gemini AI Support)
```
[User Message] ──> [/api/chatbot Router]
                        │
             (Load DB context from db.json)
                        │
             (Build Comprehensive System Prompt:
              - List all approved studios, pricing
              - Inject active studio packages/hours
              - Instruct Gemini to ONLY reference these details)
                        │
                        ▼
             [Gemini 2.5 AI Response] ──> [Client Chat Drawer]
```
- **Safety Boundaries:** If a customer asks a question outside the scope of Cainta's database, Gemini returns a polite redirection, preventing hallucinations of prices or services.

---
*Audit Completed by: AI Coding Agent (Gemini Core Engine).*
