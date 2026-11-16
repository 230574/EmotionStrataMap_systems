package com.example.backend.repository;

import com.example.backend.entity.PlaceType;
import com.example.backend.entity.RepresentativePlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepresentativePlaceRepository extends JpaRepository<RepresentativePlace, Long> {

    List<RepresentativePlace> findByPlaceType(PlaceType placeType);

    List<RepresentativePlace> findByNameContainingIgnoreCase(String name);
}
