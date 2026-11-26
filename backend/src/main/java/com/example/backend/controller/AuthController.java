package com.example.backend.controller;

import com.example.backend.entity.User;
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
            String displayName = value(payload, "displayName", "username", "nickname");
            String email = value(payload, "email");
            String password = value(payload, "password");
            String passwordConfirmation = value(payload, "passwordConfirmation", "passwordConfirm");
            boolean termsAgreed = Boolean.TRUE.equals(payload.get("termsAgreed"))
                    || Boolean.TRUE.equals(payload.get("terms"));

            if (!passwordConfirmation.isBlank() && !password.equals(passwordConfirmation)) {
                throw new IllegalArgumentException("パスワードが一致しません");
            }
            if (passwordConfirmation.isBlank()) {
                throw new IllegalArgumentException("確認用パスワードを入力してください");
            }

            User user = authService.register(displayName, email, password, termsAgreed);

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "message", "アカウントを作成しました",
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "username", user.getNickname(),
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

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request
    ) {
        try {
            String email = value(payload, "email", "username");
            String password = value(payload, "password");
            User user = authService.login(email, password);

            var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase());
            var authentication = new UsernamePasswordAuthenticationToken(
                    user.getEmail() != null ? user.getEmail() : user.getUsername(),
                    null,
                    List.of(authority)
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            var session = request.getSession(true);
            session.setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    context
            );

            String redirectTo = "ADMIN".equalsIgnoreCase(user.getRole())
                    ? "/admin/posts"
                    : "/map";

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "message", "ログインしました",
                    "redirectTo", redirectTo,
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail() != null ? user.getEmail() : "",
                            "username", user.getNickname(),
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
                    "message", "ログインしていません"
            ));
        }

        String loginId = authentication.getName();
        User user = authService.findByEmail(loginId);
        if (user == null) {
            user = authService.findByUsername(loginId);
        }
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "ログインしていません"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "username", user.getNickname(),
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
                "message", "ログアウトしました"
        ));
    }

    private String value(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object value = payload.get(key);
            if (value != null) {
                String text = String.valueOf(value).trim();
                if (!text.isBlank()) return text;
            }
        }
        return "";
    }
}
