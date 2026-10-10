# Cost Management

## 1. Purpose

This document defines the cost-management strategy for the
Cloud Run Sidecar Pattern for Observability Injection project.

The project is being developed using a limited Google Cloud credit
budget. Cloud resources must therefore be created deliberately,
monitored during development, and removed or scaled down when they
are no longer required.

Cost management is treated as an engineering requirement throughout
the project lifecycle.

---

## 2. Cost Management Principles

The project follows these principles:

1. Create only resources required by a defined project requirement.
2. Prefer managed serverless services where appropriate.
3. Avoid continuously running resources during development.
4. Use scale-to-zero where practical.
5. Avoid unnecessarily large CPU and memory allocations.
6. Monitor cloud resource usage during development.
7. Review active resources at the end of every cloud work session.
8. Remove temporary resources when they are no longer required.
9. Avoid introducing additional services without architectural
   justification.
10. Document significant cost-related decisions.

---

## 3. Expected Google Cloud Resources

The initial architecture is expected to use:

| Resource | Purpose | Cost Consideration |
|---|---|---|
| Cloud Run | Application and sidecar runtime | Request/compute usage |
| Artifact Registry | Container image storage | Stored image data |
| Cloud Build | Container image builds | Build execution |
| Cloud Logging | Application/platform logs | Log ingestion/storage |
| Cloud Monitoring | Metrics | Monitoring usage |
| Cloud Trace | Distributed tracing | Trace ingestion/storage |
| IAM | Access control | No separate runtime cost |

Actual usage will be monitored during implementation.

---

## 4. Cloud Run Cost Strategy

The initial Cloud Run configuration will target:

```text
Minimum instances: 0
Billing model: Request-based