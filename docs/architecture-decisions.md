# Architecture Decision Records

This document records the major architectural decisions made for the
Cloud Run Sidecar Pattern for Observability Injection project.

The purpose of these records is to make the reasoning behind the
architecture explicit and reproducible.

---

## ADR-001: Use Google Cloud Run as the Runtime Platform

### Status

Accepted

### Context

The project needs a managed container runtime capable of running an
application together with an observability sidecar.

The solution should demonstrate a practical serverless deployment
model without requiring management of virtual machines or Kubernetes
clusters.

### Options Considered

1. Google Cloud Run
2. Google Kubernetes Engine
3. Compute Engine

### Decision

Use Google Cloud Run as the primary runtime platform.

### Why

Cloud Run provides:

- Managed container execution
- Automatic scaling
- Scale-to-zero capability
- Multi-container service support
- Container-level resource configuration
- Startup dependency mechanisms
- Reduced infrastructure management overhead

It directly supports the sidecar architecture required by the
project.

### Trade-offs

Cloud Run provides less infrastructure-level control than a
Kubernetes-based platform.

### Consequence

The project remains focused on the Cloud Run sidecar pattern rather
than introducing unnecessary cluster-management complexity.

---

## ADR-002: Use a Multi-Container Sidecar Architecture

### Status

Accepted

### Context

The project aims to demonstrate how observability can be introduced
alongside an application without making observability infrastructure
part of the application's core runtime logic.

### Options Considered

1. Embed all observability functionality directly into the application.
2. Deploy a separate observability service.
3. Run an OpenTelemetry Collector as a sidecar.

### Decision

Use a two-container Cloud Run service consisting of:

- Application container
- OpenTelemetry Collector sidecar

### Why

The sidecar pattern provides a clear separation between application
responsibilities and observability responsibilities while keeping the
components within the same Cloud Run instance.

### Trade-offs

The additional container introduces:

- Additional resource consumption
- Startup dependency considerations
- Additional deployment configuration

### Consequence

The project can demonstrate both the benefits and operational
considerations of sidecar-based observability.

---

## ADR-003: Use OpenTelemetry Collector for Telemetry Processing

### Status

Accepted

### Context

The project requires a standardized telemetry pipeline for
application observability.

### Options Considered

1. Application-specific direct export to individual Google Cloud
   services.
2. Custom telemetry forwarding service.
3. OpenTelemetry Collector.

### Decision

Use an OpenTelemetry Collector as the observability sidecar.

### Why

The collector provides a dedicated component for receiving,
processing, and exporting telemetry.

It also maintains a clear boundary between application telemetry
generation and telemetry infrastructure.

### Trade-offs

The collector requires:

- Additional configuration
- Additional container resources
- Telemetry pipeline validation

### Consequence

The application can generate telemetry through OpenTelemetry while
the collector manages the downstream telemetry pipeline.

---

## ADR-004: Use Local OTLP Communication Between Containers

### Status

Accepted

### Context

The application must send telemetry to the collector without
exposing the collector as a public service.

### Decision

Use OTLP communication over the local Cloud Run network interface.

The initial protocol is OTLP/gRPC.

```text
Application
     |
     | OTLP/gRPC
     v
localhost:4317
     |
     v
OTel Collector