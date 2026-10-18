# HelioStudio — Interactive 3D Solar Configurator + White-Label SaaS

**Product Promise:** *"Show the system. Explain the estimate. Capture the opportunity."*

HelioStudio is an interactive 3D solar sales configurator paired with a white-label installer CRM, equipment catalog, transparent preliminary estimator, and proposal workflow.

## 1. Architecture & Runtime Overview
- **Single-File Canvas Web App (`heliostudio.html`)**: Self-contained HTML5/CSS/JS application using Tailwind CSS (`3.4.17`), Three.js (`r128`), and Chart.js (`4.4.1`) for direct interactive execution in browser/Canvas environments.
- **Modular Source Architecture (`heliostudio/`)**:
  - `lib/estimator.js`: Isolated, unit-tested solar sizing, panel/inverter DC/AC ratio checking, LFP battery sizing, decimal-safe integer minor-unit financial calculations, discount/tax ordering (`before_tax` vs `after_tax`), and quote input validation.
  - `lib/seedData.js`: Deterministic seed dataset for **SunGrid Energy (Sample Demo)** with 9 leads, 7 configurations, 12 catalog products (including 1 archived SKU for historical snapshot verification), 4 proposals across `Draft`, `Sent`, `Accepted`, and `Declined`, 5 follow-ups, and multi-tenant isolation test records.
  - `lib/store.js`: Repository abstraction with `localStorage` persistence (`heliostudio_workspace_state_v1_2`), schema version validation, corrupt-data recovery, role permission matrix enforcement (`Owner/Admin`, `Sales`, `Viewer`), workflow automation rules, and the deterministic **Helio Assistant (Sales Copilot)**.
  - `lib/scene3d.js`: Encapsulated Three.js WebGL scene controller with procedural monocrystalline solar modules, pitched roof planes, exterior inverter, modular LFP battery packs, camera orbit/zoom/presets, day/evening lighting demonstration, roof cutaway mode, raycast component selection, and an interactive **2D Technical SVG Schematic** fallback.
  - `lib/uiPublic.js` & `lib/uiWorkspace.js`: Experience A (Public Landing Page, 6-Step Configurator, Read-Only Share/Print View) and Experience B (Workspace Overview, Leads Table/Kanban, Lead Detail, Saved Configurations, Catalog CRUD, Pricing & Assumptions, Proposal Builder & Print View, Analytics, and Brand/Role/Integration Settings).
  - `tests/estimator.test.js`: Automated Node.js test suite (`node --test`).

## 2. Running Locally & Running Tests
```bash
# Run automated unit and end-to-end integration tests
node --test tests/estimator.test.js
```
To run the application in any browser, open `heliostudio.html` directly or serve the directory with any static HTTP server (`npx serve .` or `python3 -m http.server 8000`).

## 3. What Is Truly Integrated vs. Simulated (Demo Mode Boundaries)
- **Truly Implemented & Verified**:
  - Interactive 3D Three.js WebGL rooftop solar & battery scene + 2D SVG technical schematic mode.
  - Complete 6-step customer configurator connected to live estimator math and package presets (`Essential`, `Balanced`, `Backup Plus`).
  - End-to-end persistence in browser `localStorage`: submitting a quote request saves the configuration snapshot, creates a lead in the workspace pipeline, and schedules an initial qualification follow-up.
  - Proposal builder with line-item editing, discount/tax ordering, partial payments, printable customer-ready layout, and snapshot locking when marked `Sent`.
  - Role permission matrix simulation (`Owner/Admin`, `Sales`, `Viewer`) and tenant isolation checks.
  - Deterministic template-based Sales Copilot grounded in actual workspace records.
- **Simulated / Not Configured in Browser Demo Mode**:
  - Database persistence uses browser `localStorage` rather than a multi-tenant cloud database.
  - Role switching is a client-side demonstration control, not production authentication.
  - External email (SMTP/Resend), WhatsApp Business Cloud API, and online payment gateways are marked `Not configured` and never claim fake message delivery or payment charges.

## 4. Production Deployment Checklist
- [ ] Provision managed PostgreSQL / Supabase backend with Row-Level Security (RLS) policies per `organization_id`.
- [ ] Configure production authentication and server-side session verification.
- [ ] Move proposal and pricing recalculation to a server-side API boundary.
- [ ] Replace fictional sample catalog SKUs and prices with verified company equipment and legal warranty terms.
- [ ] Connect transactional email/WhatsApp providers and server-side AI provider keys with rate limiting.
