package com.example.backend.service;

import com.example.backend.entity.Emotion;
import com.example.backend.entity.Post;
import com.example.backend.entity.User;
import com.example.backend.repository.EmotionRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(PostService.class)
class PostServiceTest {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void createPost_shouldPersistAndReturnSavedPost() {
        User user = new User();
        user.setUsername("tester");
        user.setPasswordHash("hash");
        user.setRole("USER");
        userRepository.save(user);

        Emotion emotion = new Emotion();
        emotion.setName("happy");
        emotion.setDisplayName("楽しい");
        emotion.setIconColor("#2ecc71");
        emotionRepository.save(emotion);

        Post saved = postService.createPost(
                "tester",
                "happy",
                35.6895,
                139.6917,
                "Nice place",
                "Tokyo Station"
        );

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUser().getUsername()).isEqualTo("tester");
        assertThat(saved.getEmotion().getName()).isEqualTo("happy");
        assertThat(postRepository.findByDeletedFalseOrderByCreatedAtDesc()).hasSize(1);
    }
}
