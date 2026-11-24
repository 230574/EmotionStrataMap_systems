package com.example.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of(
                "message", "Hello from EmotionStrataMap backend",
                "status", "ok"
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "EmotionStrataMap backend",
                "status", "ok",
                "timestamp", Instant.now().toString()
        );
    }
}
