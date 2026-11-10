package com.example.backend.controller;

import com.example.backend.service.EmotionSummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EmotionSummaryController {

    private final EmotionSummaryService emotionSummaryService;

    public EmotionSummaryController(EmotionSummaryService emotionSummaryService) {
        this.emotionSummaryService = emotionSummaryService;
    }

    @GetMapping("/emotion-summary")
    public ResponseEntity<Map<String, Object>> summarize(
            @RequestParam(defaultValue = "35.6895") double lat,
            @RequestParam(defaultValue = "139.6917") double lng,
            @RequestParam(defaultValue = "5.0") double radiusKm) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("center", Map.of("lat", lat, "lng", lng));
        response.put("radiusKm", radiusKm);
        response.put("summary", emotionSummaryService.summarize(lat, lng, radiusKm));
        return ResponseEntity.ok(response);
    }
}
