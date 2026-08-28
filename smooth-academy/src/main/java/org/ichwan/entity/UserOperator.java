package org.ichwan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_operators", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "operator"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserOperator {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OperatorType operator;
}
