package com.example.backend.service;

import com.example.backend.entity.Emotion;
import com.example.backend.entity.Post;
import com.example.backend.entity.User;
import com.example.backend.repository.EmotionRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final UserRepository userRepository;
    private final EmotionRepository emotionRepository;
    private final PostRepository postRepository;

    public PostService(UserRepository userRepository,
                       EmotionRepository emotionRepository,
                       PostRepository postRepository) {
        this.userRepository = userRepository;
        this.emotionRepository = emotionRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public Post createPost(String username,
                          String emotionName,
                          double latitude,
                          double longitude,
                          String comment,
                          String locationName) {
        String safeUsername = username == null || username.isBlank() ? "tester" : username.trim();
        String normalizedEmotionName = normalizeEmotionName(emotionName);

        User user = userRepository.findByUsername(safeUsername)
            .orElseGet(() -> createDefaultUser(safeUsername));

        Emotion emotion = emotionRepository.findByName(normalizedEmotionName)
            .orElseGet(() -> createDefaultEmotion(normalizedEmotionName));

        Post post = new Post();
        post.setUser(user);
        post.setEmotion(emotion);
        post.setLatitude(latitude);
        post.setLongitude(longitude);
        post.setComment(comment);
        post.setLocationName(locationName);
        post.setDeleted(false);

        return postRepository.save(post);
    }

    private User createDefaultUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash("temporary-password");
        user.setRole("USER");
        user.setDeleted(false);
        return userRepository.save(user);
    }

    private Emotion createDefaultEmotion(String emotionName) {
        Emotion emotion = new Emotion();
        emotion.setName(emotionName);

        switch (emotionName) {
            case "joy":
                emotion.setDisplayName("喜び");
                emotion.setIconColor("#22c55e");
                break;
            case "worry":
                emotion.setDisplayName("不安・心配");
                emotion.setIconColor("#a855f7");
                break;
            case "fear":
                emotion.setDisplayName("怖い・恐怖");
                emotion.setIconColor("#ef4444");
                break;
            case "sad":
                emotion.setDisplayName("悲しい・寂しい");
                emotion.setIconColor("#3b82f6");
                break;
            case "happy":
            default:
                emotion.setDisplayName("楽しい");
                emotion.setIconColor("#facc15");
                break;
        }

        return emotionRepository.save(emotion);
    }

    private String normalizeEmotionName(String emotionName) {
        if (emotionName == null || emotionName.isBlank()) {
            return "happy";
        }

        String normalized = emotionName.trim().toLowerCase();
        switch (normalized) {
            case "楽しい":
                return "happy";
            case "喜び":
                return "joy";
            case "不安":
            case "不安・心配":
                return "worry";
            case "怖い":
            case "恐怖":
            case "怖い・恐怖":
                return "fear";
            case "悲しい":
            case "寂しい":
            case "悲しい・寂しい":
                return "sad";
            default:
                return normalized;
        }
    }

    public Optional<Post> findLatest() {
        return postRepository.findByDeletedFalseOrderByCreatedAtDesc().stream().findFirst();
    }

    public List<Post> findAllVisible() {
        return postRepository.findByDeletedFalseOrderByCreatedAtDesc();
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
        post.setDeleted(true);
        postRepository.save(post);
    }
}
