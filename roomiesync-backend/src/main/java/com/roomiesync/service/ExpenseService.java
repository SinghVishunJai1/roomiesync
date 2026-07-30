package com.roomiesync.service;

import com.roomiesync.model.Expense;
import com.roomiesync.model.ExpenseSplit;
import com.roomiesync.model.Settlement;
import com.roomiesync.model.User;
import com.roomiesync.repository.ExpenseRepository;
import com.roomiesync.repository.ExpenseSplitRepository;
import com.roomiesync.repository.SettlementRepository;
import com.roomiesync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseSplitRepository expenseSplitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    public Expense addExpense(Expense expense) {
        Expense savedExpense = expenseRepository.save(expense);

        List<User> allUsers = userRepository.findAll();
        int totalUsers = allUsers.size();

        if (totalUsers > 0) {
            double splitAmount = expense.getAmount() / totalUsers;

            for (User user : allUsers) {
                ExpenseSplit split = new ExpenseSplit();
                split.setExpenseId(savedExpense.getId());
                split.setUserId(user.getId());
                split.setAmountOwed(splitAmount);

                if (user.getId().equals(expense.getPaidByUserId())) {
                    split.setIsSettled(true);
                } else {
                    split.setIsSettled(false);
                }

                expenseSplitRepository.save(split);
            }
        }

        return savedExpense;
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<ExpenseSplit> getPendingSplitsForUser(Long userId) {
        return expenseSplitRepository.findByUserIdAndIsSettled(userId, false);
    }

    public Settlement createSettlementRequest(Settlement settlement) {
        settlement.setStatus("PENDING");
        return settlementRepository.save(settlement);
    }

    public List<Settlement> getPendingSettlements() {
        return settlementRepository.findByStatus("PENDING");
    }

    public Settlement verifyAndClearSettlement(Long settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        settlement.setStatus("APPROVED");

        if (settlement.getExpenseId() != null) {
            List<ExpenseSplit> splits = expenseSplitRepository.findByUserIdAndIsSettled(settlement.getPayerUserId(), false);
            for (ExpenseSplit split : splits) {
                if (split.getExpenseId().equals(settlement.getExpenseId())) {
                    split.setIsSettled(true);
                    expenseSplitRepository.save(split);
                }
            }
        }

        return settlementRepository.save(settlement);
    }
}