package org.ichwan.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.ichwan.entity.Level;
import org.ichwan.entity.OperatorType;
import org.ichwan.entity.QuizResult;
import org.ichwan.entity.UserOperator;
import org.ichwan.repository.LevelRepository;
import org.ichwan.repository.QuizResultRepository;
import org.ichwan.repository.UserOperatorRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AccessService {

    @Inject
    UserOperatorRepository userOperatorRepository;

    @Inject
    LevelRepository levelRepository;

    @Inject
    QuizResultRepository quizResultRepository;

    /**
     * Returns the effective max level for a user+operator based on active entitlements.
     * Empty Optional = no access at all.
     * Optional.empty() means no access.
     * Optional with level = capped at that level.
     * If any active entitlement has maxLevel=null, returns highest level (unlimited).
     */
    public Optional<Level> getMaxAccessibleLevel(UUID userId, OperatorType operator) {
        List<UserOperator> active = userOperatorRepository.findActiveByUserAndOperator(userId, operator);
        if (active.isEmpty()) {
            return Optional.empty();
        }

        // If any active row has maxLevel=null → unlimited
        boolean hasUnlimited = active.stream().anyMatch(uo -> uo.getMaxLevel() == null);
        if (hasUnlimited) {
            return Optional.of(
                    levelRepository.findAll().stream()
                            .max(Comparator.comparingInt(Level::getSortOrder))
                            .orElse(null)
            );
        }

        // Take the highest sortOrder among active rows' maxLevel
        return active.stream()
                .map(UserOperator::getMaxLevel)
                .filter(l -> l != null)
                .max(Comparator.comparingInt(Level::getSortOrder));
    }

    /**
     * Checks if the user has earned enough stars on the previous level to unlock this level.
     * Level 1 is always unlocked.
     * For level N, user must have earned requiredStars on level N-1 for this operator.
     */
    public boolean hasStarProgression(UUID userId, OperatorType operator, int targetLevelId) {
        if (targetLevelId <= 1) return true;

        Optional<Level> targetLevel = levelRepository.findByIdOptional(targetLevelId);
        if (targetLevel.isEmpty()) return false;

        Level target = targetLevel.get();
        int requiredStars = target.getRequiredStars();

        // Find best stars on previous level for this operator
        int prevLevelId = targetLevelId - 1;
        List<QuizResult> prevResults = quizResultRepository.findByUserId(userId).stream()
                .filter(r -> {
                    int lid = r.getLevel() != null ? r.getLevel().getId() : 0;
                    String op = r.getOperator();
                    return lid == prevLevelId && operator.name().equalsIgnoreCase(op != null ? op : "");
                })
                .toList();

        int bestStars = prevResults.stream()
                .mapToInt(QuizResult::getStarsEarned)
                .max()
                .orElse(0);

        return bestStars >= requiredStars;
    }

    /**
     * Combined check: entitlement ceiling AND star progression.
     */
    public boolean canPlayLevel(UUID userId, OperatorType operator, int levelId) {
        Optional<Level> maxLevel = getMaxAccessibleLevel(userId, operator);
        if (maxLevel.isEmpty()) return false;

        // Check entitlement ceiling
        Level requested = levelRepository.findByIdOptional(levelId).orElse(null);
        if (requested == null) return false;
        if (requested.getSortOrder() > maxLevel.get().getSortOrder()) return false;

        // Check star progression
        return hasStarProgression(userId, operator, levelId);
    }

    /**
     * Returns a summary of all operator access for a user.
     */
    public List<UserOperator> getAllActiveEntitlements(UUID userId) {
        return userOperatorRepository.findByUserId(userId).stream()
                .filter(UserOperator::isActive)
                .toList();
    }
}
