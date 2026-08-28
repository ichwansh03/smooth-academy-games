package org.ichwan.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.ichwan.entity.UserOperator;
import org.ichwan.entity.OperatorType;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserOperatorRepository implements PanacheRepositoryBase<UserOperator, UUID> {

    public List<UserOperator> findByUserId(UUID userId) {
        return list("user.id = ?1", userId);
    }

    public boolean hasOperator(UUID userId, OperatorType operator) {
        return count("user.id = ?1 AND operator = ?2", userId, operator) > 0;
    }

    public void deleteByUserAndOperator(UUID userId, OperatorType operator) {
        delete("user.id = ?1 AND operator = ?2", userId, operator);
    }
}
