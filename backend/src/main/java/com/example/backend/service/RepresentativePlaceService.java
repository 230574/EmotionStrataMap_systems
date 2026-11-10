package com.example.backend.service;

import com.example.backend.entity.PlaceType;
import com.example.backend.entity.RepresentativePlace;
import com.example.backend.repository.RepresentativePlaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepresentativePlaceService {

    private final PlaceTypeService placeTypeService;
    private final RepresentativePlaceRepository representativePlaceRepository;

    public RepresentativePlaceService(PlaceTypeService placeTypeService,
                                     RepresentativePlaceRepository representativePlaceRepository) {
        this.placeTypeService = placeTypeService;
        this.representativePlaceRepository = representativePlaceRepository;
    }

    @Transactional
    public RepresentativePlace createPlace(String name, double latitude, double longitude, String placeTypeName) {
        PlaceType placeType = placeTypeService.findOrCreate(placeTypeName, 100);

        RepresentativePlace place = new RepresentativePlace();
        place.setName(name);
        place.setLatitude(latitude);
        place.setLongitude(longitude);
        place.setPlaceType(placeType);
        return representativePlaceRepository.save(place);
    }
}
