package com.example.backend;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HelloControllerTest {

    @Test
    void helloApi_shouldReturnStructuredMessage() {
        HelloController controller = new HelloController();

        Map<String, Object> response = controller.hello();

        assertEquals(
                "Hello from EmotionStrataMap backend",
                response.get("message")
        );
        assertEquals("ok", response.get("status"));
    }

    @Test
    void healthApi_shouldReturnServiceStatus() {
        HelloController controller = new HelloController();

        Map<String, Object> response = controller.health();

        assertEquals(
                "EmotionStrataMap backend",
                response.get("service")
        );
        assertEquals("ok", response.get("status"));
    }
}