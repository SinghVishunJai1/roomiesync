package com.roomiesync.controller;

import com.roomiesync.model.BountyRequest;
import com.roomiesync.model.Task;
import com.roomiesync.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin("*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // --- TASK APIs ---

    @PostMapping("/add")
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @GetMapping("/user/{userId}")
    public List<Task> getTasksByUser(@PathVariable Long userId) {
        return taskService.getTasksByUser(userId);
    }

    @PutMapping("/{taskId}/complete")
    public Task completeTask(@PathVariable Long taskId) {
        return taskService.completeTask(taskId);
    }

    // --- BOUNTY & SWAP APIs ---

    @PostMapping("/{taskId}/bounty")
    public BountyRequest createBounty(@PathVariable Long taskId, @RequestParam Long userId, @RequestParam Double amount) {
        return taskService.createBounty(taskId, userId, amount);
    }

    @GetMapping("/bounties/open")
    public List<BountyRequest> getOpenBounties() {
        return taskService.getOpenBounties();
    }

    @PutMapping("/bounties/{bountyId}/claim")
    public BountyRequest claimBounty(@PathVariable Long bountyId, @RequestParam Long claimingUserId) {
        return taskService.claimBounty(bountyId, claimingUserId);
    }
}