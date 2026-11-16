package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "emotions")
public class Emotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String emotionName;

    @Column(nullable = false, length = 10)
    private String colorName;

    @Column(nullable = false)
    private Integer sortOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return emotionName;
    }

    public void setName(String name) {
        this.emotionName = name;
    }

    public String getEmotionName() {
        return emotionName;
    }

    public void setEmotionName(String emotionName) {
        this.emotionName = emotionName;
    }

    public String getColorName() {
        return colorName;
    }

    public void setColorName(String colorName) {
        this.colorName = colorName;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
