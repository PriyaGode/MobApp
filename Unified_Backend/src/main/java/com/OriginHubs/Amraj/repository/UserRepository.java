package com.OriginHubs.Amraj.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.OriginHubs.Amraj.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);

    @Query(value = """
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        INNER JOIN orders o ON o.user_id = u.id
        WHERE o.created_at >= :since
        AND UPPER(u.role) = 'USER'
    """, nativeQuery = true)
    Long countActiveCustomersSince(@Param("since") java.time.OffsetDateTime since);
}
