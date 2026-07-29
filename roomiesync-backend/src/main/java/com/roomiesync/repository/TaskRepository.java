package com.roomiesync.repository;

import com.roomiesync.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Kisi specific user ko kaun-kaun se tasks assign hain
    List<Task> findByAssignedToUserId(Long userId);
}