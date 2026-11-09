package com.example.backend.repository;

import com.example.backend.entity.Emotion;
import com.example.backend.entity.Post;
import com.example.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PostRepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void postCanBeSavedAndFoundByEmotion() {
        User user = new User();
        user.setUsername("post-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion emotion = new Emotion();
        emotion.setName("joy");
        emotion.setDisplayName("喜び");
        emotion.setIconColor("#f1c40f");
        emotion = emotionRepository.save(emotion);

        Post post = new Post();
        post.setUser(user);
        post.setEmotion(emotion);
        post.setLatitude(35.0);
        post.setLongitude(139.0);
        post.setLocationName("テスト地点");
        post.setComment("test comment");
        postRepository.save(post);

        assertThat(postRepository.findByDeletedFalseOrderByCreatedAtDesc()).hasSize(1);
        assertThat(postRepository.findByEmotion_Id(emotion.getId())).hasSize(1);
    }
}
