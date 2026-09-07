package org.ichwan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "quiz_answers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_result_id", nullable = false)
    private QuizResult quizResult;

    @Column(nullable = false)
    private int questionIndex;

    @Column(nullable = false)
    private int numA;

    @Column(nullable = false)
    private int numB;

    @Column(nullable = false)
    private int correctAnswer;

    @Column(nullable = false)
    private int userAnswer;

    @Column(nullable = false)
    private boolean isCorrect;

    private Integer responseTimeMs;
}
