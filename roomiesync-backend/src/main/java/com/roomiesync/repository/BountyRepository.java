package com.roomiesync.repository;

import com.roomiesync.model.BountyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BountyRepository extends JpaRepository<BountyRequest, Long> {
    // Jo tasks abhi open hain market me bounty ke liye
    List<BountyRequest> findByStatus(String status);
}