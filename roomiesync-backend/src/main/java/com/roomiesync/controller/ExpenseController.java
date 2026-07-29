package com.roomiesync.controller;

import com.roomiesync.model.Expense;
import com.roomiesync.model.ExpenseSplit;
import com.roomiesync.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping("/add")
    public Expense addExpense(@RequestBody Expense expense) {
        return expenseService.addExpense(expense);
    }

    @GetMapping("/pending/{userId}")
    public List<ExpenseSplit> getPendingSplits(@PathVariable Long userId) {
        return expenseService.getPendingSplitsForUser(userId);
    }
}