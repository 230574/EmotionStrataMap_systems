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
@Import(SearchPostService.class)
class SearchPostServiceTest {

    @Autowired
    private SearchPostService searchPostService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void search_shouldFilterByEmotionAndKeyword() {
        User user = new User();
        user.setUsername("search-user");
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
        p1.setComment("nice park");
        p1.setLocationName("Park A");
        postRepository.save(p1);

        var results = searchPostService.search("park", "happy", null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("Park A");
    }
}
