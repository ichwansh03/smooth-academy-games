package org.ichwan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_results")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @Column(nullable = false)
    private String mode;

    @Column(nullable = true)
    private String operator;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "correct_count", nullable = false)
    private int correctCount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "stars_earned", nullable = false)
    private int starsEarned;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
