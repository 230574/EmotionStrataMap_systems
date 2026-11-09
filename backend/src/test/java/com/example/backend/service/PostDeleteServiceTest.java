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
class PostDeleteServiceTest {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmotionRepository emotionRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void deletePost_shouldMarkDeletedWithoutRemovingRecord() {
        User user = new User();
        user.setUsername("deleter");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion emotion = new Emotion();
        emotion.setName("fear");
        emotion.setDisplayName("怖い");
        emotion.setIconColor("#9b59b6");
        emotion = emotionRepository.save(emotion);

        Post post = new Post();
        post.setUser(user);
        post.setEmotion(emotion);
        post.setLatitude(35.7);
        post.setLongitude(139.7);
        post.setComment("delete me");
        post.setLocationName("delete place");
        post = postRepository.save(post);

        postService.deletePost(post.getId());

        Post deleted = postRepository.findById(post.getId()).orElseThrow();
        assertThat(deleted.isDeleted()).isTrue();
        assertThat(postService.findAllVisible()).isEmpty();
    }
}
