package org.ichwan.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.ichwan.entity.*;
import org.ichwan.repository.LevelRepository;
import org.ichwan.repository.UserOperatorRepository;
import org.ichwan.repository.UserRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    UserOperatorRepository userOperatorRepository;

    @Inject
    LevelRepository levelRepository;

    private String hashPassword(String password) {
        return password;
    }

    private Level getLevelBySortOrder(int sortOrder) {
        return levelRepository.find("sortOrder", sortOrder).firstResult();
    }

    @Transactional
    public User register(String email, String password, String displayName) {
        if (email == null || password == null) {
            throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }
        if (userRepository.find("email", email).firstResult() != null) {
            throw new WebApplicationException(Response.Status.CONFLICT);
        }

        User user = User.builder()
                .email(email)
                .displayName(displayName)
                .passwordHash(hashPassword(password))
                .build();
        userRepository.persist(user);

        // Guest baseline: ADD + SUBTRACT, capped at Satuan (sortOrder=1)
        Level satuan = getLevelBySortOrder(1);
        grantEntitlement(user, OperatorType.ADD, satuan, null, SourceType.GUEST_DEFAULT);
        grantEntitlement(user, OperatorType.SUBTRACT, satuan, null, SourceType.GUEST_DEFAULT);

        return user;
    }

    public User login(String email, String password) {
        if (email == null || password == null) {
            throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }
        User user = userRepository.find("email", email).firstResult();
        if (user == null || !user.getPasswordHash().equals(password)) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        }
        return user;
    }

    public User findByEmail(String email) {
        User user = userRepository.find("email", email).firstResult();
        if (user == null) {
            throw new WebApplicationException(404);
        }
        return user;
    }

    public User findById(UUID id) {
        return userRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException(404));
    }

    public List<String> getOperators(UUID userId) {
        return userOperatorRepository.findByUserId(userId).stream()
                .filter(UserOperator::isActive)
                .map(uo -> uo.getOperator().name().toLowerCase())
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional
    public void grantEntitlement(User user, OperatorType operator, Level maxLevel, Instant expiresAt, SourceType source) {
        userOperatorRepository.findExact(user.getId(), operator).ifPresentOrElse(
                existing -> {
                    existing.setMaxLevel(maxLevel);
                    existing.setExpiresAt(expiresAt);
                    existing.setSource(source);
                },
                () -> {
                    UserOperator uo = UserOperator.builder()
                            .user(user)
                            .operator(operator)
                            .maxLevel(maxLevel)
                            .expiresAt(expiresAt)
                            .source(source)
                            .build();
                    userOperatorRepository.persist(uo);
                }
        );
    }

    @Transactional
    public void subscribeOperator(User user, OperatorType operator, Duration duration) {
        grantEntitlement(user, operator, null, Instant.now().plus(duration), SourceType.SUBSCRIPTION);
    }

    @Transactional
    public void revokeOperator(User user, OperatorType operator) {
        userOperatorRepository.deleteByUserAndOperator(user.getId(), operator);
    }

    @Transactional
    public void setOperators(User user, List<OperatorType> operators) {
        userOperatorRepository.delete("user.id", user.getId());
        Level satuan = getLevelBySortOrder(1);
        for (OperatorType op : operators) {
            grantEntitlement(user, op, satuan, null, SourceType.GUEST_DEFAULT);
        }
    }
}
