package com.example.backend.controller;

import com.example.backend.service.TimeSeriesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TimeSeriesController {

    private final TimeSeriesService timeSeriesService;

    public TimeSeriesController(TimeSeriesService timeSeriesService) {
        this.timeSeriesService = timeSeriesService;
    }

    @GetMapping("/time-series")
    public ResponseEntity<Map<String, Object>> timeSeries(
            @RequestParam(defaultValue = "0") int startHour,
            @RequestParam(defaultValue = "23") int endHour,
            @RequestParam(required = false) String emotion) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("series", timeSeriesService.buildSeries(startHour, endHour, emotion));
        return ResponseEntity.ok(response);
    }
}
