package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.entity.RepresentativePlace;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.RepresentativePlaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchPostService {

    private static final ZoneId TOKYO_ZONE = ZoneId.of("Asia/Tokyo");
    private static final DateTimeFormatter SLASH_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final PostRepository postRepository;
    private final RepresentativePlaceRepository representativePlaceRepository;

    public SearchPostService(PostRepository postRepository, RepresentativePlaceRepository representativePlaceRepository) {
        this.postRepository = postRepository;
        this.representativePlaceRepository = representativePlaceRepository;
    }

    @Transactional(readOnly = true)
    public List<Post> search(String keyword,
                             String emotionName,
                             String fromDate,
                             String toDate,
                             Double minLng,
                             Double minLat,
                             Double maxLng,
                             Double maxLat) {
        List<RepresentativePlace> matchedPlaces = resolveMatchedPlaces(keyword);
        List<SearchCircle> fallbackCircles = resolveFallbackCircles(keyword);
        boolean hasBoundingBox = hasBoundingBox(minLng, minLat, maxLng, maxLat);

        return postRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
            .filter(post -> hasBoundingBox
                    ? isInsideBoundingBox(post, minLng, minLat, maxLng, maxLat)
                    : matchesKeyword(post, keyword, matchedPlaces, fallbackCircles))
                .filter(post -> isInsideDateRange(post, fromDate, toDate))
                .filter(post -> emotionName == null || emotionName.isBlank()
                        || post.getEmotion() != null && post.getEmotion().getName().equalsIgnoreCase(emotionName))
                .collect(Collectors.toList());
    }

    private boolean isInsideDateRange(Post post, String fromDate, String toDate) {
        LocalDate postDate = toLocalDate(post.getCreatedAt());
        if (postDate == null) {
            return false;
        }

        LocalDate from = parseDate(fromDate);
        LocalDate to = parseDate(toDate);

        if (from != null && postDate.isBefore(from)) {
            return false;
        }

        if (to != null && postDate.isAfter(to)) {
            return false;
        }

        return true;
    }

    private LocalDate toLocalDate(Instant instant) {
        if (instant == null) {
            return null;
        }

        return instant.atZone(TOKYO_ZONE).toLocalDate();
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String trimmed = value.trim();
        try {
            return LocalDate.parse(trimmed);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDate.parse(trimmed, SLASH_DATE_FORMATTER);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private boolean hasBoundingBox(Double minLng, Double minLat, Double maxLng, Double maxLat) {
        return minLng != null && minLat != null && maxLng != null && maxLat != null;
    }

    private boolean isInsideBoundingBox(Post post, Double minLng, Double minLat, Double maxLng, Double maxLat) {
        double lat = post.getLatitude();
        double lng = post.getLongitude();
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    }

    private List<RepresentativePlace> resolveMatchedPlaces(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        return representativePlaceRepository.findByNameContainingIgnoreCase(keyword.trim());
    }

    private boolean matchesKeyword(Post post, String keyword, List<RepresentativePlace> matchedPlaces, List<SearchCircle> fallbackCircles) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String normalizedKeyword = keyword.toLowerCase();
        boolean textMatched = (post.getLocationName() != null && post.getLocationName().toLowerCase().contains(normalizedKeyword))
                || (post.getComment() != null && post.getComment().toLowerCase().contains(normalizedKeyword));

        if (textMatched) {
            return true;
        }

        if (isInsideAnyRepresentativePlace(post, matchedPlaces)) {
            return true;
        }

        return isInsideAnyFallbackCircle(post, fallbackCircles);
    }

    private List<SearchCircle> resolveFallbackCircles(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        String normalized = normalizeKeyword(keyword);
        if (normalized.contains("杉並区") || normalized.contains("杉並")) {
            return List.of(new SearchCircle(35.6993, 139.6365, 4500));
        }

        if (isTokyoWideKeyword(normalized)) {
            return List.of(new SearchCircle(35.6895, 139.6917, 50000));
        }

        return List.of();
    }

    private String normalizeKeyword(String keyword) {
        return keyword.trim().toLowerCase().replace(" ", "").replace("　", "");
    }

    private boolean isTokyoWideKeyword(String normalizedKeyword) {
        return "東京".equals(normalizedKeyword)
                || "東京都".equals(normalizedKeyword)
                || "tokyo".equals(normalizedKeyword);
    }

    private boolean isInsideAnyRepresentativePlace(Post post, List<RepresentativePlace> places) {
        if (places == null || places.isEmpty()) {
            return false;
        }

        for (RepresentativePlace place : places) {
            if (place == null) {
                continue;
            }

            int radiusMeters = place.getPlaceType() != null ? Math.max(place.getPlaceType().getRadiusMeters(), 1) : 100;
            double distanceMeters = haversineMeters(
                    post.getLatitude(),
                    post.getLongitude(),
                    place.getLatitude(),
                    place.getLongitude()
            );

            if (distanceMeters <= radiusMeters) {
                return true;
            }
        }

        return false;
    }

    private boolean isInsideAnyFallbackCircle(Post post, List<SearchCircle> circles) {
        if (circles == null || circles.isEmpty()) {
            return false;
        }

        for (SearchCircle circle : circles) {
            if (circle == null) {
                continue;
            }

            double distanceMeters = haversineMeters(
                    post.getLatitude(),
                    post.getLongitude(),
                    circle.centerLat,
                    circle.centerLng
            );

            if (distanceMeters <= circle.radiusMeters) {
                return true;
            }
        }

        return false;
    }

    private double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
        final double earthRadiusMeters = 6371000;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusMeters * c;
    }

    private static class SearchCircle {
        private final double centerLat;
        private final double centerLng;
        private final int radiusMeters;

        private SearchCircle(double centerLat, double centerLng, int radiusMeters) {
            this.centerLat = centerLat;
            this.centerLng = centerLng;
            this.radiusMeters = radiusMeters;
        }
    }
}
