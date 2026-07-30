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
    private Long taskId;

    @Column(nullable = false)
    private Long offeredByUserId;

    @Column(nullable = false)
    private Double bountyAmount;

    private Long claimedByUserId;

    @Column(nullable = false)
    private String status = "Open";
}