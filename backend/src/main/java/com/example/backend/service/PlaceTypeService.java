package com.example.backend.service;

import com.example.backend.entity.PlaceType;
import com.example.backend.repository.PlaceTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaceTypeService {

    private final PlaceTypeRepository placeTypeRepository;

    public PlaceTypeService(PlaceTypeRepository placeTypeRepository) {
        this.placeTypeRepository = placeTypeRepository;
    }

    public PlaceType findOrCreate(String name, int radiusMeters) {
        return placeTypeRepository.findByName(name)
                .orElseGet(() -> {
                    PlaceType type = new PlaceType();
                    type.setName(name);
                    type.setRadiusMeters(radiusMeters);
                    return placeTypeRepository.save(type);
                });
    }

    @Transactional
    public PlaceType create(String name, int radiusMeters) {
        return findOrCreate(name, radiusMeters);
    }

    public List<PlaceType> findAll() {
        return placeTypeRepository.findAll();
    }
}
