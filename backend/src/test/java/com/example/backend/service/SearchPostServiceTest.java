package com.example.backend.service;

import com.example.backend.entity.Emotion;
import com.example.backend.entity.PlaceType;
import com.example.backend.entity.Post;
import com.example.backend.entity.RepresentativePlace;
import com.example.backend.entity.User;
import com.example.backend.repository.EmotionRepository;
import com.example.backend.repository.PlaceTypeRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.RepresentativePlaceRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
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

    @Autowired
    private PlaceTypeRepository placeTypeRepository;

    @Autowired
    private RepresentativePlaceRepository representativePlaceRepository;

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

        var results = searchPostService.search("park", "happy", null, null, null, null, null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("Park A");
    }

    @Test
    void search_shouldMatchPostsInsideRepresentativePlaceRadius() {
        User user = new User();
        user.setUsername("tokyo-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        PlaceType placeType = new PlaceType();
        placeType.setName("city");
        placeType.setRadiusMeters(500);
        placeType = placeTypeRepository.save(placeType);

        RepresentativePlace tokyo = new RepresentativePlace();
        tokyo.setName("東京駅");
        tokyo.setLatitude(35.681236);
        tokyo.setLongitude(139.767125);
        tokyo.setPlaceType(placeType);
        representativePlaceRepository.save(tokyo);

        Post inside = new Post();
        inside.setUser(user);
        inside.setEmotion(happy);
        inside.setLatitude(35.6815);
        inside.setLongitude(139.7674);
        inside.setComment("radius matched post");
        inside.setLocationName("丸の内");
        postRepository.save(inside);

        Post outside = new Post();
        outside.setUser(user);
        outside.setEmotion(happy);
        outside.setLatitude(35.6895);
        outside.setLongitude(139.6917);
        outside.setComment("outside post");
        outside.setLocationName("新宿");
        postRepository.save(outside);

        var results = searchPostService.search("東京", null, null, null, null, null, null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("丸の内");
    }

    @Test
    void search_shouldMatchTokyoFallbackCircleWhenRepresentativePlaceMissing() {
        User user = new User();
        user.setUsername("tokyo-fallback-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        Post tokyoPost = new Post();
        tokyoPost.setUser(user);
        tokyoPost.setEmotion(happy);
        tokyoPost.setLatitude(35.6895);
        tokyoPost.setLongitude(139.6917);
        tokyoPost.setComment("center of tokyo");
        tokyoPost.setLocationName("地図上の場所");
        postRepository.save(tokyoPost);

        Post osakaPost = new Post();
        osakaPost.setUser(user);
        osakaPost.setEmotion(happy);
        osakaPost.setLatitude(34.6937);
        osakaPost.setLongitude(135.5023);
        osakaPost.setComment("osaka area");
        osakaPost.setLocationName("大阪");
        postRepository.save(osakaPost);

        var results = searchPostService.search("東京", null, null, null, null, null, null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("地図上の場所");
    }

    @Test
    void search_shouldMatchSuginamiFallbackCircleWhenKeywordIsSuginami() {
        User user = new User();
        user.setUsername("suginami-fallback-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        Post suginamiPost = new Post();
        suginamiPost.setUser(user);
        suginamiPost.setEmotion(happy);
        suginamiPost.setLatitude(35.6995);
        suginamiPost.setLongitude(139.6368);
        suginamiPost.setComment("suginami area");
        suginamiPost.setLocationName("杉並エリア");
        postRepository.save(suginamiPost);

        Post farPost = new Post();
        farPost.setUser(user);
        farPost.setEmotion(happy);
        farPost.setLatitude(35.6895);
        farPost.setLongitude(139.6917);
        farPost.setComment("shinjuku side");
        farPost.setLocationName("新宿");
        postRepository.save(farPost);

        var results = searchPostService.search("杉並区", null, null, null, null, null, null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("杉並エリア");
    }

    @Test
    void search_shouldPreferWardCircleWhenKeywordContainsSuginamiAndTokyo() {
        User user = new User();
        user.setUsername("suginami-priority-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        Post suginamiPost = new Post();
        suginamiPost.setUser(user);
        suginamiPost.setEmotion(happy);
        suginamiPost.setLatitude(35.6992);
        suginamiPost.setLongitude(139.6366);
        suginamiPost.setComment("suginami exact area");
        suginamiPost.setLocationName("杉並駅周辺");
        postRepository.save(suginamiPost);

        Post tokyoCenterPost = new Post();
        tokyoCenterPost.setUser(user);
        tokyoCenterPost.setEmotion(happy);
        tokyoCenterPost.setLatitude(35.6895);
        tokyoCenterPost.setLongitude(139.6917);
        tokyoCenterPost.setComment("tokyo center");
        tokyoCenterPost.setLocationName("東京中心");
        postRepository.save(tokyoCenterPost);

        var results = searchPostService.search("杉並区 東京", null, null, null, null, null, null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("杉並駅周辺");
    }

    @Test
    void search_shouldFilterByBoundingBoxWhenProvided() {
        User user = new User();
        user.setUsername("bbox-user");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        Emotion happy = new Emotion();
        happy.setName("happy");
        happy.setDisplayName("楽しい");
        happy.setIconColor("#2ecc71");
        happy = emotionRepository.save(happy);

        Post setagaya = new Post();
        setagaya.setUser(user);
        setagaya.setEmotion(happy);
        setagaya.setLatitude(35.6464);
        setagaya.setLongitude(139.6532);
        setagaya.setComment("setagaya post");
        setagaya.setLocationName("世田谷");
        postRepository.save(setagaya);

        Post machida = new Post();
        machida.setUser(user);
        machida.setEmotion(happy);
        machida.setLatitude(35.5466);
        machida.setLongitude(139.4386);
        machida.setComment("machida post");
        machida.setLocationName("町田");
        postRepository.save(machida);

        var results = searchPostService.search(
                "世田谷",
                null,
                null,
                null,
                139.58,
                35.60,
                139.72,
                35.69
        );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLocationName()).isEqualTo("世田谷");
    }
}
