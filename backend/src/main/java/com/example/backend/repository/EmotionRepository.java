package com.example.backend.repository;

import com.example.backend.entity.Emotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmotionRepository extends JpaRepository<Emotion, Long> {
    @Query("SELECT e FROM Emotion e WHERE e.emotionName = :name")
    Optional<Emotion> findByName(@Param("name") String name);
}
