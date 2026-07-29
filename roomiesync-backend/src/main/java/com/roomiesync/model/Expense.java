package com.roomiesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // Jaise: "Wi-Fi Bill", "Grocery"

    @Column(nullable = false)
    private Double amount; // Kitna kharcha hua

    @Column(nullable = false)
    private Long paidByUserId; // Kis user ne bill bhara uska ID

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // Kab add kiya gaya
}