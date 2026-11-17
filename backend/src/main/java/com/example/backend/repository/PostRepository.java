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

    @Query("SELECT p FROM Post p WHERE p.isDeleted = false ORDER BY p.postedAt DESC")
    List<Post> findVisibleOrderByPostedAtDesc();

    @Query("SELECT p FROM Post p WHERE p.isDeleted = false")
    List<Post> findVisible();

    @Query("SELECT p FROM Post p WHERE p.emotion.id = :emotionId AND p.isDeleted = false")
    List<Post> findVisibleByEmotionId(@Param("emotionId") Long emotionId);

    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND p.isDeleted = false")
    List<Post> findVisibleByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Post p WHERE p.isDeleted = false " +
            "AND (:keyword IS NULL OR LOWER(p.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.locationName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:emotionName IS NULL OR p.emotion.emotionName = :emotionName) " +
            "AND (:fromDate IS NULL OR p.postedAt >= :fromDate) " +
            "AND (:toDate IS NULL OR p.postedAt <= :toDate)")
    List<Post> searchPosts(
            @Param("keyword") String keyword,
            @Param("emotionName") String emotionName,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate
    );
}
