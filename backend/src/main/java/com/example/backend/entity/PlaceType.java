package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "place_types")
public class PlaceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "type_name", nullable = false, unique = true, length = 30)
    private String typeName;

    @Column(name = "radius_m", nullable = false)
    private Integer radiusM;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return typeName;
    }

    public void setName(String name) {
        this.typeName = name;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public Integer getRadiusM() {
        return radiusM;
    }

    public void setRadiusM(Integer radiusM) {
        this.radiusM = radiusM;
    }

    public void setRadiusMeters(int radiusMeters) {
        this.radiusM = radiusMeters;
    }

    public Integer getRadiusMeters() {
        return radiusM;
    }
}
