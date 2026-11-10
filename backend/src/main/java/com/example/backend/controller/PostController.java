package com.example.backend.controller;

import com.example.backend.entity.Post;
import com.example.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/posts")
    public Map<String, Object> listPosts() {
        List<Map<String, Object>> posts = postService.findAllVisible().stream()
                .map(post -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", post.getId());
                    item.put("username", post.getUser().getUsername());
                    item.put("emotion", post.getEmotion().getName());
                    item.put("lat", post.getLatitude());
                    item.put("lng", post.getLongitude());
                    item.put("comment", post.getComment());
                    item.put("locationName", post.getLocationName());
                    item.put("createdAt", post.getCreatedAt().toString());
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("count", posts.size());
        response.put("posts", posts);
        return response;
    }

    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(@RequestBody Map<String, Object> payload) {
        try {
            String username = String.valueOf(payload.getOrDefault("username", "tester"));
            String emotionName = String.valueOf(payload.getOrDefault("emotion", "happy"));
            double latitude = Double.parseDouble(String.valueOf(payload.getOrDefault("lat", 0.0)));
            double longitude = Double.parseDouble(String.valueOf(payload.getOrDefault("lng", 0.0)));
            String comment = String.valueOf(payload.getOrDefault("comment", ""));
            String locationName = String.valueOf(payload.getOrDefault("locationName", "unknown"));

            Post saved = postService.createPost(username, emotionName, latitude, longitude, comment, locationName);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "post created");
            response.put("post", Map.of(
                    "id", saved.getId(),
                    "username", saved.getUser().getUsername(),
                    "emotion", saved.getEmotion().getName(),
                    "lat", saved.getLatitude(),
                    "lng", saved.getLongitude(),
                    "comment", saved.getComment(),
                    "locationName", saved.getLocationName(),
                    "createdAt", saved.getCreatedAt().toString()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable Long postId) {
        try {
            postService.deletePost(postId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "post deleted");
            response.put("postId", postId);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
