package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

@Service
public class PostDetailService {

    private final PostRepository postRepository;

    public PostDetailService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post getById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
    }
}
