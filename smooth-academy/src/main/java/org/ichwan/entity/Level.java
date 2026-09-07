package org.ichwan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "levels")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Level {

    @Id
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String icon;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private int minRange;

    @Column(nullable = false)
    private int maxRange;

    @Column(nullable = false)
    @Builder.Default
    private int requiredStars = 0;

    @Column(nullable = false)
    private int sortOrder;
}
