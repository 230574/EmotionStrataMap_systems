package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TimeSeriesService {

    private final PostRepository postRepository;

    public TimeSeriesService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Map<String, Object>> buildSeries(int startHour, int endHour, String emotionName) {
        List<Post> posts = postRepository.findByDeletedFalseOrderByCreatedAtDesc();
        List<Map<String, Object>> data = new ArrayList<>();

        for (int hour = startHour; hour <= endHour; hour++) {
            final int targetHour = hour;
            long count = posts.stream()
                    .filter(post -> post.getCreatedAt() != null)
                    .filter(post -> post.getEmotion() != null)
                    .filter(post -> emotionName == null || emotionName.isBlank()
                            || post.getEmotion().getName().equalsIgnoreCase(emotionName))
                    .filter(post -> {
                        Instant instant = post.getCreatedAt();
                        int postHour = instant.atZone(ZoneId.systemDefault()).getHour();
                        return postHour == targetHour;
                    })
                    .count();

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("hour", hour);
            point.put("label", String.format("%02d:00", hour));
            point.put("count", count);
            data.add(point);
        }

        return data;
    }
}
