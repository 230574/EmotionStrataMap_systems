package com.example.backend.controller;

import com.example.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
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
            String nickname = payload.containsKey("nickname")
                    ? String.valueOf(payload.get("nickname"))
                    : username;

            var user = authService.register(username, password, nickname);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "user registered");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "nickname", user.getNickname(),
                    "role", user.getRole()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", ex.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request
    ) {
        try {
            String username = String.valueOf(payload.get("username"));
            String password = String.valueOf(payload.get("password"));
            var user = authService.login(username, password);

            var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase());
            var authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, List.of(authority)
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            var session = request.getSession(true);
            session.setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    context
            );

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "message", "login successful",
                    "user", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "nickname", user.getNickname(),
                            "role", user.getRole()
                    )
            ));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", ex.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "not authenticated"
            ));
        }

        var user = authService.findByUsername(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "not authenticated"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "nickname", user.getNickname(),
                        "role", user.getRole()
                )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "logout successful"
        ));
    }
}
