package com.example.backend.controller;

import com.example.backend.entity.Post;
import com.example.backend.entity.User;
import com.example.backend.service.AuthService;
import com.example.backend.service.PostDetailService;
import com.example.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PostDetailController {

    private final PostDetailService postDetailService;
    private final AuthService authService;
    private final PostService postService;

    public PostDetailController(PostDetailService postDetailService, AuthService authService, PostService postService) {
        this.postDetailService = postDetailService;
        this.authService = authService;
        this.postService = postService;
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> detail(@PathVariable Long postId) {
        try {
            Post post = postDetailService.getById(postId);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("post", Map.of(
                    "id", post.getId(),
                    "username", post.getUser().getUsername(),
                    "emotion", post.getEmotion().getName(),
                    "comment", post.getComment(),
                    "locationName", post.getLocationName(),
                    "lat", post.getLatitude(),
                    "lng", post.getLongitude(),
                    "createdAt", post.getCreatedAt().toString()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> updatePost(@PathVariable Long postId, @RequestBody Post postDetails, Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication);
            Post updatedPost = postService.updatePost(postId, postDetails, user);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("post", Map.of(
                    "id", updatedPost.getId(),
                    "username", updatedPost.getUser().getUsername(),
                    "emotion", updatedPost.getEmotion().getName(),
                    "comment", updatedPost.getComment(),
                    "locationName", updatedPost.getLocationName(),
                    "lat", updatedPost.getLatitude(),
                    "lng", updatedPost.getLongitude(),
                    "createdAt", updatedPost.getCreatedAt().toString()
            ));
            return ResponseEntity.ok(response);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", "error",
                    "message", "権限がありません"
            ));
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
