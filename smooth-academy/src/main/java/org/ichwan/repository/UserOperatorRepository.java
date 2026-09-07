package org.ichwan.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.ichwan.entity.OperatorType;
import org.ichwan.entity.UserOperator;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserOperatorRepository implements PanacheRepositoryBase<UserOperator, UUID> {

    public List<UserOperator> findByUserId(UUID userId) {
        return list("user.id = ?1", userId);
    }

    public List<UserOperator> findActiveByUserAndOperator(UUID userId, OperatorType operator) {
        return list("user.id = ?1 AND operator = ?2 AND (expiresAt IS NULL OR expiresAt > ?3)",
                userId, operator, Instant.now());
    }

    public Optional<UserOperator> findExact(UUID userId, OperatorType operator) {
        return find("user.id = ?1 AND operator = ?2", userId, operator).firstResultOptional();
    }

    public void deleteByUserAndOperator(UUID userId, OperatorType operator) {
        delete("user.id = ?1 AND operator = ?2", userId, operator);
    }
}
