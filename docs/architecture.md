# System Architecture

## 1. Architecture Overview

The project implements a multi-container Google Cloud Run service
using the sidecar pattern for standardized application observability.

The Cloud Run service contains two containers:

1. Application container
2. OpenTelemetry Collector sidecar

The application container handles incoming application traffic.
The OpenTelemetry Collector handles telemetry processing and export.

The architecture separates application functionality from the
observability pipeline while allowing both components to operate
within the same Cloud Run instance.

---

## 2. High-Level Architecture

```text
                         User / Client
                              |
                              | HTTPS
                              v
                    +----------------------+
                    |      Cloud Run       |
                    |       Service        |
                    |                      |
                    |  +----------------+  |
                    |  |  Application   |  |
                    |  |   Container    |  |
                    |  |                |  |
                    |  | HTTP :8080     |  |
                    |  +-------+--------+  |
                    |          |           |
                    |         OTLP         |
                    |          |           |
                    |          v           |
                    |  +----------------+  |
                    |  | OpenTelemetry  |  |
                    |  |   Collector    |  |
                    |  |    Sidecar     |  |
                    |  |                |  |
                    |  | OTLP :4317     |  |
                    |  +-------+--------+  |
                    +----------|-----------+
                               |
                               v
                 Google Cloud Observability
                         /    |    \
                        /     |     \
                       v      v      v
                    Logging Monitoring Trace