package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmotionSummaryService {

    private final PostRepository postRepository;

    public EmotionSummaryService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Map<String, Object>> summarize(double centerLat, double centerLng, double radiusKm) {
        List<Post> posts = postRepository.findByDeletedFalseOrderByCreatedAtDesc();
        List<Map<String, Object>> summary = new ArrayList<>();

        for (Post post : posts) {
            double distance = haversine(centerLat, centerLng, post.getLatitude(), post.getLongitude());
            if (distance <= radiusKm) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("emotion", post.getEmotion().getName());
                row.put("count", 1);
                row.put("lat", post.getLatitude());
                row.put("lng", post.getLongitude());
                summary.add(row);
            }
        }

        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Map<String, Object> row : summary) {
            String emotion = String.valueOf(row.get("emotion"));
            counts.put(emotion, counts.getOrDefault(emotion, 0) + 1);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        counts.forEach((emotion, count) -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("emotion", emotion);
            item.put("count", count);
            result.add(item);
        });

        return result;
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
