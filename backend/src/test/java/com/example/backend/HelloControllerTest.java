package com.example.backend;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HelloControllerTest {

    @Test
    void helloApi_shouldReturnStructuredMessage() {
        HelloController controller = new HelloController();
        Map<String, Object> response = controller.hello();

        assertEquals("Hello from EmotionStrataMap backend", response.get("message"));
        assertEquals("ok", response.get("status"));
    }

    @Test
    void healthApi_shouldReturnServiceStatus() {
        HelloController controller = new HelloController();
        Map<String, Object> response = controller.health();

        assertEquals("EmotionStrataMap backend", response.get("service"));
        assertEquals("ok", response.get("status"));
    }

    @Test
    void mapPointsApi_shouldReturnGeoJsonCollection() {
        HelloController controller = new HelloController();
        Map<String, Object> response = controller.mapPoints(35.6895, 139.6917, 5.0);

        assertEquals("FeatureCollection", response.get("type"));
        assertEquals("ok", response.get("status"));
        assertEquals("EmotionStrataMap backend", response.get("service"));

        Map<String, Object> center = (Map<String, Object>) response.get("center");
        assertEquals(35.6895, center.get("lat"));
        assertEquals(139.6917, center.get("lng"));
    }

    @Test
    void createPostApi_shouldReturnSavedPost() {
        HelloController controller = new HelloController();

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("lat", 35.6895);
        request.put("lng", 139.6917);
        request.put("emotion", "happy");
        request.put("comment", "Nice place");
        request.put("locationName", "Tokyo Station");

        Map<String, Object> response = controller.createPost(request);

        assertEquals("ok", response.get("status"));
        assertEquals("happy", ((Map<String, Object>) response.get("post")).get("emotion"));
        assertEquals("Tokyo Station", ((Map<String, Object>) response.get("post")).get("locationName"));
    }

    @Test
    void listPostsApi_shouldReturnPostCollection() {
        HelloController controller = new HelloController();

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("lat", 35.6895);
        request.put("lng", 139.6917);
        request.put("emotion", "joy");
        request.put("comment", "Good vibe");
        request.put("locationName", "Shibuya");
        controller.createPost(request);

        Map<String, Object> response = controller.listPosts();

        assertEquals("ok", response.get("status"));
        assertEquals(1, response.get("count"));
    }

    @Test
    void locationApi_shouldAcceptGeolocationCoordinates() {
        HelloController controller = new HelloController();

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("lat", 35.6895);
        request.put("lng", 139.6917);

        Map<String, Object> response = controller.currentLocation(request);

        assertEquals("ok", response.get("status"));
        assertEquals(35.6895, ((Map<String, Object>) response.get("center")).get("lat"));
        assertEquals(139.6917, ((Map<String, Object>) response.get("center")).get("lng"));
    }
}
