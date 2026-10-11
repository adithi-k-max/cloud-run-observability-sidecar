# Stage 1: Build the TRACEFORGE frontend
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Stage 2: Build the FastAPI application
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY application/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY application/main.py ./main.py

# Include the compiled frontend
COPY --from=frontend-build /frontend/dist /app/frontend-dist

# Run as a non-root user
RUN useradd --create-home appuser

USER appuser

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]