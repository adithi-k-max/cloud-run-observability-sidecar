\# Application and Observability Integration



\## 1. Project Overview



This project demonstrates the OpenTelemetry sidecar pattern for collecting application telemetry. The application is built using Spring Boot and runs in a Docker container. An OpenTelemetry Collector runs as a separate container and receives telemetry from the application.



\## 2. Application Details



\- Framework: Spring Boot

\- Language: Java

\- Build tool: Maven

\- Application port: 8080

\- Container image: `observability-app:1.1`

\- OpenTelemetry Java agent: 2.21.0



\## 3. Application Endpoints



| Endpoint | Purpose |

|---|---|

| `/` | Application home endpoint |

| `/health` | Health response |

| `/products` | Product endpoint |

| `/slow` | Simulates a slow request |

| `/error` | Simulates an application error |



\## 4. Observability Architecture



1\. A client sends an HTTP request to the Spring Boot application.

2\. The OpenTelemetry Java agent instruments the application.

3\. The agent exports traces using OTLP over HTTP.

4\. The OpenTelemetry Collector receives telemetry on port 4318.

5\. The Collector processes and exports traces to its configured debug exporter for local verification.



\## 5. Local Containers



\- Application container: `observability-container`

\- Collector container: `otel-collector`

\- Docker network: `observability-network`



Both containers must be connected to the same Docker network so the application can reach the Collector using the hostname `otel-collector`.



\## 6. Verification



The application container can be inspected using:



`docker logs observability-container --tail 50`



The Collector output can be inspected using:



`docker logs otel-collector --tail 50`



Trace output should include request information such as the HTTP route, response status, and trace ID. The simulated error endpoint can also produce exception details.



\## 7. Google Cloud Run Integration



The local setup is a development and verification environment. The deployment configuration must be adapted for Google Cloud Run's multi-container service, including the application container, Collector container, ports, and telemetry endpoint.



\## 8. Current Limitations



The local debug exporter is intended for verification. A production deployment should configure an appropriate telemetry backend and secure the telemetry pipeline. Successful local tracing does not by itself prove that the Google Cloud Run deployment is complete.

