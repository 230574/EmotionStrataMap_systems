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
@Import(PostDetailService.class)
class PostDetailServiceTest {

    @Autowired
    private PostDetailService postDetailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void getPostDetail_shouldReturnSelectedPost() {
        User user = new User();
        user.setUsername("detail-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion emotion = new Emotion();
        emotion.setName("anxious");
        emotion.setDisplayName("不安");
        emotion.setIconColor("#e74c3c");
        emotion = emotionRepository.save(emotion);

        Post post = new Post();
        post.setUser(user);
        post.setEmotion(emotion);
        post.setLatitude(35.0);
        post.setLongitude(139.0);
        post.setComment("nervous");
        post.setLocationName("detail place");
        post = postRepository.save(post);

        Post detail = postDetailService.getById(post.getId());
        assertThat(detail.getComment()).isEqualTo("nervous");
        assertThat(detail.getUser().getUsername()).isEqualTo("detail-user");
    }
}
