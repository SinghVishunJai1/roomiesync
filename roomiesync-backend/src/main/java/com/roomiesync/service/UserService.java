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

    // Server start hote hi agar koi admin nahi hoga, toh default ban jayega
    @PostConstruct
    public void createDefaultAdmin() {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> "ADMIN".equals(u.getRole()));

        if (!adminExists) {
            User admin = new User();
            admin.setName("Admin Boss");
            admin.setEmail("admin@roomiesync.com");
            admin.setPassword("admin123"); // Aap baad mein ise change bhi kar sakte hain
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Default Admin Created: admin@roomiesync.com / admin123");
        }
    }

    // Naya flatmate register karne ke liye
    public User registerUser(User user) {
        return userRepository.save(user);
    }

    // Email سے user find karne ke liye
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Sare flatmates ki list nikalne ke liye
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            // Optional: Agar tasks ya expenses table mein foreign key constraint hai,
            // toh delete karne se pehle unhein yahan clear kar sakte hain ya DB mein Cascade Delete enable karein.
            userRepository.deleteById(id);
        } else {
            throw new RuntimeException("User not found");
        }
    }
}