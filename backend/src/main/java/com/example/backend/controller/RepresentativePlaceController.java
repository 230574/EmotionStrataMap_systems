package com.example.backend.controller;

import com.example.backend.service.RepresentativePlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RepresentativePlaceController {

    private final RepresentativePlaceService representativePlaceService;

    public RepresentativePlaceController(RepresentativePlaceService representativePlaceService) {
        this.representativePlaceService = representativePlaceService;
    }

    @PostMapping("/representative-places")
    public ResponseEntity<Map<String, Object>> createRepresentativePlace(@RequestBody Map<String, Object> payload) {
        try {
            String name = String.valueOf(payload.get("name"));
            double latitude = Double.parseDouble(String.valueOf(payload.get("lat")));
            double longitude = Double.parseDouble(String.valueOf(payload.get("lng")));
            String placeTypeName = String.valueOf(payload.getOrDefault("placeType", "station"));

            var place = representativePlaceService.createPlace(name, latitude, longitude, placeTypeName);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("message", "representative place created");
            response.put("place", Map.of(
                    "id", place.getId(),
                    "name", place.getName(),
                    "lat", place.getLatitude(),
                    "lng", place.getLongitude(),
                    "placeType", place.getPlaceType().getName()
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
