import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import (
    OTLPMetricExporter,
)
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter,
)
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# --------------------------------------------------
# Logging
# --------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("observability-demo")


# --------------------------------------------------
# Shared OpenTelemetry resource
# --------------------------------------------------

resource = Resource.create(
    {
        "service.name": "observability-demo-api",
        "service.version": "1.0.0",
        "deployment.environment": "local",
    }
)


# --------------------------------------------------
# Distributed tracing
# --------------------------------------------------

trace_provider = TracerProvider(resource=resource)

trace_exporter = OTLPSpanExporter(
    endpoint="http://otel-collector:4317",
    insecure=True,
)

trace_provider.add_span_processor(
    BatchSpanProcessor(trace_exporter)
)

trace.set_tracer_provider(trace_provider)

tracer = trace.get_tracer("observability-demo")


# --------------------------------------------------
# Application metrics
# --------------------------------------------------

metric_exporter = OTLPMetricExporter(
    endpoint="http://otel-collector:4317",
    insecure=True,
)

metric_reader = PeriodicExportingMetricReader(
    metric_exporter,
    export_interval_millis=5000,
)

meter_provider = MeterProvider(
    resource=resource,
    metric_readers=[metric_reader],
)

metrics.set_meter_provider(meter_provider)

meter = metrics.get_meter("observability-demo")

request_counter = meter.create_counter(
    name="app.requests",
    description="Number of requests handled by application endpoints",
    unit="1",
)

request_duration = meter.create_histogram(
    name="app.request.duration",
    description="Duration of application endpoint operations",
    unit="s",
)


# --------------------------------------------------
# Application lifecycle
# --------------------------------------------------

@asynccontextmanager
async def lifespan(application: FastAPI):
    """
    Manage application startup and graceful shutdown.

    The OpenTelemetry providers are initialized before the application
    starts accepting requests. During shutdown, telemetry is flushed
    and the providers are closed.
    """
    logger.info("Starting Observability Sidecar Demo API")

    try:
        yield
    finally:
        logger.info("Shutting down Observability Sidecar Demo API")

        # Attempt to shut down both providers even if one fails.
        try:
            meter_provider.shutdown()
        except Exception:
            logger.exception("Failed to shut down the metrics provider")

        try:
            trace_provider.shutdown()
        except Exception:
            logger.exception("Failed to shut down the tracing provider")


# --------------------------------------------------
# REST API
# --------------------------------------------------

app = FastAPI(
    title="Observability Sidecar Demo",
    description=(
        "REST API instrumented with OpenTelemetry traces and metrics."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# Request metrics middleware
# --------------------------------------------------

@app.middleware("http")
async def record_request_metrics(
    request: Request,
    call_next,
):
    """
    Record request count and duration.

    Health-check traffic is excluded from custom application metrics.
    Route labels are restricted to known application endpoints to avoid
    creating unbounded metric cardinality from arbitrary request paths.
    """

    if request.url.path == "/health":
        return await call_next(request)

    start_time = time.perf_counter()
    status_code = 500

    # Use a fixed set of route labels.
    known_routes = {
        "/": "/",
        "/products": "/products",
        "/error": "/error",
        "/slow": "/slow",
    }

    route_label = known_routes.get(
        request.url.path,
        "__unmatched__",
    )

    try:
        response = await call_next(request)
        status_code = response.status_code
        return response

    finally:
        duration = time.perf_counter() - start_time

        attributes = {
            "http.request.method": request.method,
            "http.route": route_label,
            "http.response.status_code": status_code,
        }

        request_counter.add(
            1,
            attributes=attributes,
        )

        request_duration.record(
            duration,
            attributes=attributes,
        )


# --------------------------------------------------
# Automatic FastAPI instrumentation
# --------------------------------------------------

FastAPIInstrumentor.instrument_app(app)


# --------------------------------------------------
# API endpoints
# --------------------------------------------------

@app.get("/")
def root():
    logger.info("Root endpoint requested")

    return {
        "message": "Observability Sidecar Demo",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


@app.get("/products")
def products():
    logger.info("Products endpoint requested")

    return {
        "products": [
            {
                "id": 1,
                "name": "Laptop",
                "price": 65000,
            },
            {
                "id": 2,
                "name": "Keyboard",
                "price": 2500,
            },
            {
                "id": 3,
                "name": "Monitor",
                "price": 12000,
            },
        ]
    }


@app.get("/error")
def controlled_error():
    logger.error("Controlled demonstration error triggered")

    raise HTTPException(
        status_code=500,
        detail="Controlled demonstration error",
    )


@app.get("/slow")
def slow_response():
    with tracer.start_as_current_span("slow-operation"):
        time.sleep(2)

    return {
        "message": "Slow operation completed",
        "duration_seconds": 2,
    }