package com.example.backend.controller;

import com.example.backend.entity.Post;
import com.example.backend.service.PostDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PostDetailController {

    private final PostDetailService postDetailService;

    public PostDetailController(PostDetailService postDetailService) {
        this.postDetailService = postDetailService;
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
}
