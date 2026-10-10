FROM otel/opentelemetry-collector-contrib:0.140.0

COPY collector-config.yaml /etc/otelcol-contrib/config.yaml

EXPOSE 4317 13133

ENTRYPOINT ["/otelcol-contrib"]
CMD ["--config=/etc/otelcol-contrib/config.yaml"]