package com.example.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class HelloController {

    private final List<Map<String, Object>> postStore = new ArrayList<>();

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

    @GetMapping("/map/points")
    public Map<String, Object> mapPoints(
            @RequestParam(defaultValue = "35.6895") double lat,
            @RequestParam(defaultValue = "139.6917") double lng,
            @RequestParam(defaultValue = "5.0") double radiusKm) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("type", "FeatureCollection");
        response.put("service", "EmotionStrataMap backend");
        response.put("status", "ok");
        response.put("center", Map.of("lat", lat, "lng", lng));
        response.put("radiusKm", radiusKm);
        response.put("features", List.of(
                Map.of(
                        "type", "Feature",
                        "id", "sample-1",
                        "properties", Map.of("name", "Tokyo Station", "category", "demo", "distanceKm", 0.0),
                        "geometry", Map.of(
                                "type", "Point",
                                "coordinates", List.of(lng, lat)
                        )
                ),
                Map.of(
                        "type", "Feature",
                        "id", "sample-2",
                        "properties", Map.of("name", "Shibuya", "category", "demo", "distanceKm", 3.5),
                        "geometry", Map.of(
                                "type", "Point",
                                "coordinates", List.of(139.7005, 35.6585)
                        )
                )
        ));

        return response;
    }

    @PostMapping("/location")
    public Map<String, Object> currentLocation(@RequestBody Map<String, Object> payload) {
        Object latObj = payload.get("lat");
        Object lngObj = payload.get("lng");

        if (latObj == null || lngObj == null) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", "lat and lng are required");
            return response;
        }

        try {
            double lat = Double.parseDouble(String.valueOf(latObj));
            double lng = Double.parseDouble(String.valueOf(lngObj));

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "location accepted");
            response.put("center", Map.of("lat", lat, "lng", lng));
            response.put("mapPointsUrl", "/api/map/points?lat=" + lat + "&lng=" + lng + "&radiusKm=5");
            return response;
        } catch (NumberFormatException ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", "lat and lng must be numbers");
            return response;
        }
    }

    @GetMapping("/posts")
    public Map<String, Object> listPosts() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("count", postStore.size());
        response.put("posts", postStore);
        return response;
    }

    @PostMapping("/posts")
    public Map<String, Object> createPost(@RequestBody Map<String, Object> payload) {
        Object latObj = payload.get("lat");
        Object lngObj = payload.get("lng");
        Object emotionObj = payload.get("emotion");

        if (latObj == null || lngObj == null || emotionObj == null) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", "lat, lng, and emotion are required");
            return response;
        }

        double lat;
        double lng;
        try {
            lat = Double.parseDouble(String.valueOf(latObj));
            lng = Double.parseDouble(String.valueOf(lngObj));
        } catch (NumberFormatException ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", "lat and lng must be numbers");
            return response;
        }

        String emotion = String.valueOf(emotionObj);
        List<String> validEmotions = List.of("happy", "joy", "anxious", "fear", "sad");
        if (!validEmotions.contains(emotion)) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "error");
            response.put("message", "emotion is invalid");
            return response;
        }

        Map<String, Object> post = new LinkedHashMap<>();
        post.put("id", "post-" + (postStore.size() + 1));
        post.put("lat", lat);
        post.put("lng", lng);
        post.put("emotion", emotion);
        post.put("comment", payload.getOrDefault("comment", ""));
        post.put("locationName", payload.getOrDefault("locationName", "unknown"));
        post.put("createdAt", Instant.now().toString());
        postStore.add(post);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("message", "post created");
        response.put("post", post);
        return response;
    }
}
