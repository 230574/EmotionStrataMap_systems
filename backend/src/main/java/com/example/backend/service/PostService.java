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

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        Emotion emotion = emotionRepository.findByName(emotionName)
                .orElseThrow(() -> new IllegalArgumentException("Emotion not found: " + emotionName));

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
