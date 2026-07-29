package com.roomiesync.service;

import com.roomiesync.model.Expense;
import com.roomiesync.model.ExpenseSplit;
import com.roomiesync.model.User;
import com.roomiesync.repository.ExpenseRepository;
import com.roomiesync.repository.ExpenseSplitRepository;
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

    // Expense add karne aur automatically split karne ka logic
    public Expense addExpense(Expense expense) {
        // 1. Pehle expense ko database me save karo
        Expense savedExpense = expenseRepository.save(expense);

        // 2. Saare registered flatmates ki list nikalo
        List<User> allUsers = userRepository.findAll();
        int totalUsers = allUsers.size();

        if (totalUsers > 0) {
            // Equal split calculation (Total Amount / Total Users)
            double splitAmount = expense.getAmount() / totalUsers;

            // 3. Har user ke liye split entry banao
            for (User user : allUsers) {
                ExpenseSplit split = new ExpenseSplit();
                split.setExpenseId(savedExpense.getId());
                split.setUserId(user.getId());
                split.setAmountOwed(splitAmount);

                // Agar is hi user ne bill bhara hai, toh uska hissa settle maana ja sakta hai (optional logic)
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

    // Kisi user ka kitna total dena baaki hai woh dekhne ke liye
    public List<ExpenseSplit> getPendingSplitsForUser(Long userId) {
        return expenseSplitRepository.findByUserIdAndIsSettled(userId, false);
    }
}