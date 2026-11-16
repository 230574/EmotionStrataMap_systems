package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class SearchPostService {

    private final PostRepository postRepository;

    public SearchPostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> search(String keyword, String emotionName, String fromDate, String toDate) {
        Instant fromInstant = parseDate(fromDate, true);
        Instant toInstant = parseDate(toDate, false);
        return postRepository.searchPosts(keyword, emotionName, fromInstant, toInstant);
    }

    private Instant parseDate(String value, boolean startOfDay) {
        if (value == null || value.isBlank()) {
            return null;
        }

        LocalDate date = LocalDate.parse(value);
        if (startOfDay) {
            return date.atStartOfDay().toInstant(ZoneOffset.UTC);
        }
        return date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
    }
}
