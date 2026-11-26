package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.service.UserAdminService;
import com.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class UserAdminController {

    private final UserAdminService userAdminService;
    private final AuthService authService;

    public UserAdminController(UserAdminService userAdminService, AuthService authService) {
        this.userAdminService = userAdminService;
        this.authService = authService;
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> listUsers() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "users", userAdminService.findAll().stream().map(user -> Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "nickname", user.getNickname(),
                        "role", user.getRole(),
                        "suspended", user.isSuspended(),
                        "deleted", user.isDeleted()
                )).collect(Collectors.toList())
        ));
    }

    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<Map<String, Object>> suspend(@PathVariable Long userId,
                                                       @RequestBody Map<String, Object> payload) {
        String reason = String.valueOf(payload.getOrDefault("reason", "管理者による利用停止"));
        userAdminService.suspendUser(userId, reason);
        return ResponseEntity.ok(Map.of("status", "ok", "message", "利用停止しました"));
    }

    @PostMapping("/users/{userId}/reactivate")
    public ResponseEntity<Map<String, Object>> reactivate(@PathVariable Long userId) {
        userAdminService.reactivateUser(userId);
        return ResponseEntity.ok(Map.of("status", "ok", "message", "利用停止を解除しました"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> logicallyDeleteUser(@PathVariable Long userId,
                                                                  Authentication authentication) {
        User operator = authService.findByUsername(authentication.getName());
        userAdminService.logicallyDeleteUser(userId, operator != null ? operator.getId() : null);
        return ResponseEntity.ok(Map.of("status", "ok", "message", "論理削除しました"));
    }
}
