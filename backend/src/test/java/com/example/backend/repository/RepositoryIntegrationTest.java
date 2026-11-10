package com.example.backend.repository;

import com.example.backend.entity.Emotion;
import com.example.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class RepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Test
    void userAndEmotionCanBeSavedAndLoaded() {
        User user = new User();
        user.setUsername("tester");
        user.setPasswordHash("hashed-password");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion emotion = new Emotion();
        emotion.setName("happy");
        emotion.setDisplayName("楽しい");
        emotion.setIconColor("#2ecc71");
        emotion = emotionRepository.save(emotion);

        assertThat(userRepository.findByUsername("tester")).isPresent();
        assertThat(emotionRepository.findByName("happy")).isPresent();
        assertThat(emotion.getId()).isNotNull();
    }
}
