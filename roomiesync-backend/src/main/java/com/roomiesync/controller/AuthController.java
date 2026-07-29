package com.roomiesync.controller;

import com.roomiesync.model.User;
import com.roomiesync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    // Simple Login API
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> existingUser = userService.findByEmail(loginRequest.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Simple password check (Aage chalkar isko BCrypt se secure kar sakte hain)
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(user); // Login successful, user details bhej do
            } else {
                return ResponseEntity.badRequest().body("Invalid password!");
            }
        } else {
            return ResponseEntity.badRequest().body("User not found with this email!");
        }
    }
}