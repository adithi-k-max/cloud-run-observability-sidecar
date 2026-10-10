import logging
import time

from fastapi import FastAPI, HTTPException
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter,
)
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("observability-demo")

resource = Resource.create(
    {
        "service.name": "observability-demo-api",
        "service.version": "1.0.0",
        "deployment.environment": "local",
    }
)

provider = TracerProvider(resource=resource)

otlp_exporter = OTLPSpanExporter(
    endpoint="http://otel-collector:4317",
    insecure=True,
)

provider.add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

app = FastAPI(
    title="Observability Sidecar Demo",
    description="A REST API instrumented with OpenTelemetry.",
    version="1.0.0",
)

FastAPIInstrumentor.instrument_app(app)


@app.get("/")
def root():
    logger.info("Root endpoint requested")
    return {
        "message": "Observability Sidecar Demo",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/products")
def products():
    logger.info("Products endpoint requested")

    return {
        "products": [
            {"id": 1, "name": "Laptop", "price": 65000},
            {"id": 2, "name": "Keyboard", "price": 2500},
            {"id": 3, "name": "Monitor", "price": 12000},
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


@app.on_event("shutdown")
def shutdown():
    provider.shutdown()