import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


# Make the application module importable from the project root.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
APPLICATION_DIR = PROJECT_ROOT / "application"

sys.path.insert(0, str(APPLICATION_DIR))

from main import app  # noqa: E402


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client


def test_root_endpoint(client):
    """The root endpoint should respond successfully."""
    response = client.get("/")

    assert response.status_code == 200


def test_health_endpoint(client):
    """The health endpoint should respond successfully."""
    response = client.get("/health")

    assert response.status_code == 200


def test_products_endpoint(client):
    """The products endpoint should return a successful response."""
    response = client.get("/products")

    assert response.status_code == 200
    assert response.json() is not None


def test_error_endpoint(client):
    """The error endpoint should return HTTP 500."""
    response = client.get("/error")

    assert response.status_code == 500


def test_slow_endpoint(client):
    """The slow endpoint should complete successfully."""
    response = client.get("/slow")

    assert response.status_code == 200