package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchPostService {

    private final PostRepository postRepository;

    public SearchPostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> search(String keyword, String emotionName, String fromDate, String toDate) {
        return postRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                .filter(post -> keyword == null || keyword.isBlank()
                        || (post.getLocationName() != null && post.getLocationName().toLowerCase().contains(keyword.toLowerCase()))
                        || (post.getComment() != null && post.getComment().toLowerCase().contains(keyword.toLowerCase())))
                .filter(post -> emotionName == null || emotionName.isBlank()
                        || post.getEmotion() != null && post.getEmotion().getName().equalsIgnoreCase(emotionName))
                .collect(Collectors.toList());
    }
}
