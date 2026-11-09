package com.example.backend.repository;

import com.example.backend.entity.PlaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaceTypeRepository extends JpaRepository<PlaceType, Long> {
    Optional<PlaceType> findByName(String name);
}
