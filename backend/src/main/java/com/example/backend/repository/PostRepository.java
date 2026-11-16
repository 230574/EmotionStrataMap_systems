package com.example.backend.repository;

import com.example.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByDeletedFalseOrderByCreatedAtDesc();

    List<Post> findByDeletedFalse();

    List<Post> findByEmotion_IdAndDeletedFalse(Long emotionId);

    List<Post> findByUser_IdAndDeletedFalse(Long userId);

    @Query("SELECT p FROM Post p WHERE p.deleted = false " +
            "AND (:keyword IS NULL OR LOWER(p.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.locationName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:emotionName IS NULL OR p.emotion.name = :emotionName) " +
            "AND (:fromDate IS NULL OR p.createdAt >= :fromDate) " +
            "AND (:toDate IS NULL OR p.createdAt <= :toDate)")
    List<Post> searchPosts(
            @Param("keyword") String keyword,
            @Param("emotionName") String emotionName,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );
}
