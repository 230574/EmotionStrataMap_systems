package com.example.backend.controller;

import com.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> payload) {
        try {
            String username = String.valueOf(payload.get("username"));
            String password = String.valueOf(payload.get("password"));

            var user = authService.register(username, password);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "user registered");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> payload) {
        try {
            String username = String.valueOf(payload.get("username"));
            String password = String.valueOf(payload.get("password"));

            var user = authService.login(username, password);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "login successful");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
