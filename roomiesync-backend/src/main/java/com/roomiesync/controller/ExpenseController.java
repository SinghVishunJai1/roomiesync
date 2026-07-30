package com.roomiesync.controller;

import com.roomiesync.model.Expense;
import com.roomiesync.model.ExpenseSplit;
import com.roomiesync.model.Settlement;
import com.roomiesync.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping("/add")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.addExpense(expense));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/splits/pending/{userId}")
    public ResponseEntity<List<ExpenseSplit>> getPendingSplitsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getPendingSplitsForUser(userId));
    }

    @GetMapping("/settlements/pending")
    public ResponseEntity<List<Settlement>> getPendingSettlements() {
        return ResponseEntity.ok(expenseService.getPendingSettlements());
    }

    @PostMapping("/settlements/pay")
    public ResponseEntity<Settlement> createSettlement(@RequestBody Settlement settlement) {
        return ResponseEntity.ok(expenseService.createSettlementRequest(settlement));
    }

    @PutMapping("/settlements/verify/{id}")
    public ResponseEntity<Settlement> verifySettlement(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.verifyAndClearSettlement(id));
    }
}