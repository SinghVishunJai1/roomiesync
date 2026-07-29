package com.roomiesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bounty_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BountyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskId; // Kis task ke liye bounty lagayi gayi hai

    @Column(nullable = false)
    private Long offeredByUserId; // Jisne task chhoda aur paise offer kiye

    @Column(nullable = false)
    private Double bountyAmount; // Kitne rupay ki bounty hai (jaise 30 Rs)

    private Long claimedByUserId; // Jis user ne task uthaya

    @Column(nullable = false)
    private String status = "Open"; // "Open", "Claimed", "Completed"
}