package com.roomiesync.service;

import com.roomiesync.model.BountyRequest;
import com.roomiesync.model.Task;
import com.roomiesync.repository.BountyRepository;
import com.roomiesync.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BountyRepository bountyRepository;

    // Naya task create karne ke liye
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // 🟢 Yeh wala method add karna hai
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToUserId(userId);
    }

    // Task complete mark karne ke liye
    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus("Completed");
        return taskRepository.save(task);
    }

    // --- BOUNTY & SWAP SYSTEM LOGIC ---

    public BountyRequest createBounty(Long taskId, Long userId, Double bountyAmount) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus("Swapped");
        taskRepository.save(task);

        BountyRequest bounty = new BountyRequest();
        bounty.setTaskId(taskId);
        bounty.setOfferedByUserId(userId);
        bounty.setBountyAmount(bountyAmount);
        bounty.setStatus("Open");

        return bountyRepository.save(bounty);
    }

    public List<BountyRequest> getOpenBounties() {
        return bountyRepository.findByStatus("Open");
    }

    public BountyRequest claimBounty(Long bountyId, Long claimingUserId) {
        BountyRequest bounty = bountyRepository.findById(bountyId).orElseThrow(() -> new RuntimeException("Bounty not found"));

        bounty.setClaimedByUserId(claimingUserId);
        bounty.setStatus("Claimed");

        Task task = taskRepository.findById(bounty.getTaskId()).orElseThrow(() -> new RuntimeException("Task not found"));
        task.setAssignedToUserId(claimingUserId);
        task.setStatus("Pending");
        taskRepository.save(task);

        return bountyRepository.save(bounty);
    }
}