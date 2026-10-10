
package com.cloudrun.observability;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.ServletException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ObservabilityApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void homeEndpointTest() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(
                    "Cloud Run Sidecar Observability Application is running!"));
    }

    @Test
    void healthEndpointTest() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("UP"));
    }

    @Test
    void productsEndpointTest() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void errorEndpointTest() throws Exception {
        ServletException exception = Assertions.assertThrows(
                ServletException.class,
                () -> mockMvc.perform(get("/error"))
        );

        Assertions.assertTrue(
                exception.getMessage().contains("Request processing failed")
        );
    }

    @Test
    void slowEndpointTest() throws Exception {
        mockMvc.perform(get("/slow"))
                .andExpect(status().isOk())
                .andExpect(content().string(
                    "Slow request completed successfully!"));
    }
}
