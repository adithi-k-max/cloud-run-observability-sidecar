
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY target/observability-0.0.1-SNAPSHOT.jar app.jar
COPY opentelemetry-javaagent.jar opentelemetry-javaagent.jar

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:/app/opentelemetry-javaagent.jar", "-Dotel.service.name=observability-app", "-Dotel.exporter.otlp.endpoint=http://otel-collector:4318", "-Dotel.exporter.otlp.protocol=http/protobuf", "-Dotel.traces.exporter=otlp", "-Dotel.metrics.exporter=none", "-Dotel.logs.exporter=none", "-jar", "app.jar"]
