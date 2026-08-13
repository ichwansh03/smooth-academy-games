package org.ichwan.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.ichwan.entity.*;
import org.ichwan.repository.QuizResultRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class QuizService {

    @Inject
    QuizResultRepository quizResultRepository;

    @Inject
    UserService userService;

    @Inject
    LevelService levelService;

    @Transactional
    public QuizResult submitResult(UUID userId, Integer levelId, String mode, String operator,
                                   Integer totalQuestions, Integer correctCount) {
        User user = userService.findById(userId);
        Level level = levelService.findById(levelId);

        BigDecimal percentage = BigDecimal.valueOf(correctCount.doubleValue() / totalQuestions * 100)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        int starsEarned;
        if (percentage.compareTo(BigDecimal.valueOf(90)) >= 0) starsEarned = 3;
        else if (percentage.compareTo(BigDecimal.valueOf(70)) >= 0) starsEarned = 2;
        else if (percentage.compareTo(BigDecimal.valueOf(50)) >= 0) starsEarned = 1;
        else starsEarned = 0;

        QuizResult result = QuizResult.builder()
                .user(user)
                .level(level)
                .mode(mode)
                .operator(operator != null ? operator : "add")
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .percentage(percentage)
                .starsEarned(starsEarned)
                .build();
        quizResultRepository.persist(result);
        return result;
    }

    public List<QuizResult> getUserResults(UUID userId) {
        return quizResultRepository.findByUserId(userId);
    }

    public QuizResult findById(UUID id) {
        return quizResultRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException(404));
    }
}
