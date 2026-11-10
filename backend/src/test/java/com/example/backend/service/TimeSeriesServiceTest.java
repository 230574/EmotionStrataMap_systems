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
@Import(TimeSeriesService.class)
class TimeSeriesServiceTest {

    @Autowired
    private TimeSeriesService timeSeriesService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void buildTimeSeries_shouldGroupByHour() {
        User user = new User();
        user.setUsername("time-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        Post p1 = new Post();
        p1.setUser(user);
        p1.setEmotion(happy);
        p1.setLatitude(35.0);
        p1.setLongitude(139.0);
        p1.setComment("one");
        p1.setLocationName("A");
        postRepository.save(p1);

        var series = timeSeriesService.buildSeries(0, 24, "happy");
        assertThat(series).isNotEmpty();
    }
}
