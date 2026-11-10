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
@Import(EmotionSummaryService.class)
class EmotionSummaryServiceTest {

    @Autowired
    private EmotionSummaryService emotionSummaryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void summarize_shouldCountEmotionDistribution() {
        User user = new User();
        user.setUsername("sum-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        Emotion sad = new Emotion();
        sad.setName("sad");
        sad.setDisplayName("悲しい");
        sad.setIconColor("#3498db");
        sad = emotionRepository.save(sad);

        Post p1 = new Post();
        p1.setUser(user);
        p1.setEmotion(happy);
        p1.setLatitude(35.0);
        p1.setLongitude(139.0);
        p1.setComment("good");
        p1.setLocationName("A");
        postRepository.save(p1);

        Post p2 = new Post();
        p2.setUser(user);
        p2.setEmotion(sad);
        p2.setLatitude(35.1);
        p2.setLongitude(139.1);
        p2.setComment("bad");
        p2.setLocationName("B");
        postRepository.save(p2);

        var summary = emotionSummaryService.summarize(35.0, 139.0, 1.0);

        assertThat(summary).hasSize(2);
        assertThat(summary.stream().anyMatch(item -> item.get("emotion").equals("happy"))).isTrue();
    }
}
