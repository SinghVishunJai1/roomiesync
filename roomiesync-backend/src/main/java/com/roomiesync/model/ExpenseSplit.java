package com.roomiesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "expense_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long expenseId; // Kis expense ka part hai

    @Column(nullable = false)
    private Long userId; // Kis user par yeh debt/hissa hai

    @Column(nullable = false)
    private Double amountOwed; // Us user ko kitna paisa dena hai

    @Column(nullable = false)
    private Boolean isSettled = false; // False = dena baaki hai, True = settle ho gaya
}