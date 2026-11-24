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
class PostListServiceTest {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void listPosts_shouldReturnSavedPostsInNewestOrder() {
        User user = new User();
        user.setUsername("viewer");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion emotion = new Emotion();
        emotion.setName("sad");
        emotion.setDisplayName("悲しい");
        emotion.setIconColor("#3498db");
        emotion = emotionRepository.save(emotion);

        Post post1 = new Post();
        post1.setUser(user);
        post1.setEmotion(emotion);
        post1.setLatitude(35.1);
        post1.setLongitude(139.1);
        post1.setComment("first");
        post1.setLocationName("A");
        postRepository.save(post1);

        Post post2 = new Post();
        post2.setUser(user);
        post2.setEmotion(emotion);
        post2.setLatitude(35.2);
        post2.setLongitude(139.2);
        post2.setComment("second");
        post2.setLocationName("B");
        postRepository.save(post2);

        assertThat(postService.findAllVisible()).hasSize(2);
        assertThat(postService.findAllVisible().get(0).getComment()).isEqualTo("second");
    }
}
