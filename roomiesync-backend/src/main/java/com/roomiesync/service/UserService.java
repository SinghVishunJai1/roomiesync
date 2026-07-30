package com.roomiesync.service;

import com.roomiesync.model.User;
import com.roomiesync.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void createDefaultAdmin() {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> "ADMIN".equals(u.getRole()));

        if (!adminExists) {
            User admin = new User();
            admin.setName("Admin Boss");
            admin.setEmail("admin@roomiesync.com");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }
    }

    public User registerUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        } else {
            throw new RuntimeException("User not found");
        }
    }
}