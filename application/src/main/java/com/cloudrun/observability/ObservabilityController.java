
package com.cloudrun.observability;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ObservabilityController {

    private static final Logger logger =
            LoggerFactory.getLogger(ObservabilityController.class);

    @GetMapping("/")
    public String home() {
        logger.info("Home endpoint accessed");
        return "Cloud Run Sidecar Observability Application is running!";
    }

    @GetMapping("/health")
    public String health() {
        logger.info("Health endpoint accessed");
        return "UP";
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products() {
        logger.info("Products endpoint accessed");

        return List.of(
            Map.of("id", 1, "name", "Handloom Bag", "price", 499),
            Map.of("id", 2, "name", "Cotton Shirt", "price", 799),
            Map.of("id", 3, "name", "Silk Scarf", "price", 299)
        );
    }

    @GetMapping("/error")
    public String error() {
        logger.error("Error endpoint accessed: simulated application error");
        throw new RuntimeException("Simulated error for observability testing");
    }

    @GetMapping("/slow")
    public String slow() throws InterruptedException {
        logger.info("Slow endpoint accessed");

        Thread.sleep(3000);

        logger.info("Slow endpoint completed after 3 seconds");
        return "Slow request completed successfully!";
    }
}
