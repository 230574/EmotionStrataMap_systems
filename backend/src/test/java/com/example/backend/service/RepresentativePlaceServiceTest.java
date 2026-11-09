package com.example.backend.service;

import com.example.backend.entity.PlaceType;
import com.example.backend.entity.RepresentativePlace;
import com.example.backend.repository.PlaceTypeRepository;
import com.example.backend.repository.RepresentativePlaceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({RepresentativePlaceService.class, PlaceTypeService.class})
class RepresentativePlaceServiceTest {

    @Autowired
    private RepresentativePlaceService representativePlaceService;

    @Autowired
    private PlaceTypeRepository placeTypeRepository;

    @Autowired
    private RepresentativePlaceRepository representativePlaceRepository;

    @Test
    void createRepresentativePlace_shouldPersistPlaceAndType() {
        PlaceType placeType = new PlaceType();
        placeType.setName("station");
        placeType.setRadiusMeters(100);
        placeTypeRepository.save(placeType);

        RepresentativePlace place = representativePlaceService.createPlace(
                "Tokyo Station",
                35.6812,
                139.7671,
                "station"
        );

        assertThat(place.getId()).isNotNull();
        assertThat(place.getName()).isEqualTo("Tokyo Station");
        assertThat(representativePlaceRepository.count()).isEqualTo(1);
    }
}
