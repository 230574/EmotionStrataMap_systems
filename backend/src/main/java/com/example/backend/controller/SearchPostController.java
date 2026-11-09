package com.example.backend.controller;

import com.example.backend.service.SearchPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SearchPostController {

    private final SearchPostService searchPostService;

    public SearchPostController(SearchPostService searchPostService) {
        this.searchPostService = searchPostService;
    }

    @GetMapping("/posts/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String emotion,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        List<Map<String, Object>> posts = searchPostService.search(keyword, emotion, fromDate, toDate).stream()
                .map(post -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", post.getId());
                    item.put("emotion", post.getEmotion().getName());
                    item.put("locationName", post.getLocationName());
                    item.put("comment", post.getComment());
                    item.put("lat", post.getLatitude());
                    item.put("lng", post.getLongitude());
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("count", posts.size());
        response.put("posts", posts);
        return ResponseEntity.ok(response);
    }
}
