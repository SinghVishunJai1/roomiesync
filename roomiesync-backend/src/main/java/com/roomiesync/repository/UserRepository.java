package com.roomiesync.repository;

import com.roomiesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Email se user ko dhoondne ke liye (Login ke waqt kaam aayega)
    Optional<User> findByEmail(String email);
}