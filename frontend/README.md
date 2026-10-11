# TraceForge

> **See the failure. Follow the signal. Protect the service.**

TraceForge is a polished, production-minded observability investigation console built for FastAPI applications using the OpenTelemetry SDK and an OpenTelemetry Collector sidecar.

This is an editorial developer tool engineered for technical diagnostics: analyzing application availability, HTTP failures, slow requests, telemetry collection health, and sidecar decoupling. It makes honest claims, never fabricates synthetic traces or mock production metrics, and provides safe manual workflows for resilience verification.

---

## Architecture Overview

```
 Browser / Console                      Docker Compose Environment
┌─────────────────────────────────┐    ┌─────────────────────────────────────────┐
│                                 │    │                                         │
│   TraceForge (React/Vite)       │    │   FastAPI App (:8080)                   │
│   http://localhost:5173         │    │   ├─ GET /                              │
│                                 │    │   ├─ GET /health                        │
│   Vite Dev Proxy:               │    │   ├─ GET /products                      │
│   /api/*  ──────────────────────┼───►│   ├─ GET /slow (~2s delay)              │
│   (prefix stripped)             │    │   └─ GET /error (returns HTTP 500)      │
│                                 │    │                                         │
│                                 │    │   OTel Python SDK                       │
│                                 │    │        │ (OTLP gRPC)                    │
│                                 │    │        ▼                                │
│                                 │    │   OTel Collector Sidecar (:4317)        │
│                                 │    │        │                                │
│                                 │    │        ▼                                │
│                                 │    │   Debug Exporter (stdout logs)          │
│                                 │    │   [No queryable historical trace API]   │
└─────────────────────────────────┘    └─────────────────────────────────────────┘
```

---

## Investigation Modules

1. **Service Pulse (`/service-pulse`)**
   - Live availability checks against `GET /api/health`.
   - Real HTTP response body inspection, status badges, and client-observed duration.
   - History table of recent frontend-issued checks and a real-data duration sparkline.
   - Explicit "Unknown" state until an actual check is executed.

2. **Failure Lab (`/failure-lab`)**
   - Interactive probe suite for `GET /`, `GET /health`, `GET /products`, `GET /slow`, and `GET /error`.
   - Client-observed request duration measured using `performance.now()`.
   - Strict separation between HTTP errors (`HTTP 500` is an expected test outcome for `/error`) and network connection failures.
   - Chronological history with slide-in details drawer.

3. **Signal Inspector (`/signal-inspector`)**
   - 4-stage telemetry pipeline verification: Application Response, OTel SDK Emission, Collector Reception, Cloud Export.
   - Explicit states: `VERIFIED`, `UNAVAILABLE`, `UNKNOWN`, and `NOT CONFIGURED`.
   - Honest empty states explaining Collector debug exporter limits and steps needed to enable Google Cloud Trace / Cloud Monitoring.

4. **Sidecar Resilience (`/sidecar-resilience`)**
   - 6-step guided manual audit verifying service availability decoupling during Collector outages.
   - Safe interface: does NOT execute shell commands or manage Docker automatically.
   - Detailed terminal instructions and interactive observation recording.

5. **Resource & Cost Guard (`/resource-cost-guard`)**
   - Distinguishes statically configured container limits from live measurements.
   - Honest `UNAVAILABLE` states for live CPU/memory metrics and `NOT CONFIGURED` for GCP billing.
   - Architectural analysis of why observability sidecars must be monitored independently.

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)
- The target FastAPI backend running locally at `http://localhost:8080`

### Installation & Local Development

```bash
# Navigate to the frontend directory
cd C:\Users\adith\.gemini\antigravity\scratch\traceforge\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser. All requests to `/api/*` will be proxied to `http://localhost:8080/*` with the `/api` prefix stripped.

---

## Production Build & Integration

### Building the Frontend

```bash
npm run build
```

The compiled assets will be written to `dist/`.

### Serving from FastAPI

To serve the compiled TraceForge console directly from your FastAPI container without an extra hosting service:

1. Copy the contents of `dist/` into a directory named `static/` in your FastAPI project.
2. In your FastAPI `main.py`, mount the static files directory after your API endpoints:

```python
from fastapi.staticfiles import StaticFiles

# Your existing routes:
# app.get("/health")...
# app.get("/products")...

# Mount static files (ensure html=True to serve index.html for root)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

---

## Verification Commands

Run these commands to verify the codebase:

```bash
# 1. Check TypeScript types
npm run type-check

# 2. Run production build
npm run build
```

---

## Technical Constraints & Honest Reporting

- **Debug Exporter**: The current OpenTelemetry Collector sidecar uses a `debug` exporter logging spans to Docker stdout. It does not provide a queryable trace search API.
- **Client vs Server Timing**: The duration reported in Failure Lab and Service Pulse is client-observed round-trip time (`performance.now()`), which includes network transit and browser parsing. It is distinctly labeled as different from server-side span durations.
- **Sidecar Isolation**: Stopping the Collector sidecar during the resilience test demonstrates that the FastAPI application continues serving requests without failure.
