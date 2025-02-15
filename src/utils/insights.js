/**
 * Spending Analysis & Insights Engine
 * Provides meaningful financial insights from transaction data.
 */

// Get transactions for a specific month
export const getMonthTransactions = (transactions, year, month) => {
    return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
};

// Get current month summary
export const getCurrentMonthSummary = (transactions) => {
    const now = new Date();
    const monthTxns = getMonthTransactions(transactions, now.getFullYear(), now.getMonth());

    const income = monthTxns
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxns
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        income,
        expenses,
        savings: income - expenses,
        transactions: monthTxns,
        incomeCount: monthTxns.filter(t => t.type === 'Income').length,
        expenseCount: monthTxns.filter(t => t.type === 'Expense').length,
    };
};

// Get top spending categories this month
export const getTopCategories = (transactions, limit) => {
    const count = limit || 5;
    const now = new Date();
    const monthTxns = getMonthTransactions(transactions, now.getFullYear(), now.getMonth());
    const expenses = monthTxns.filter(t => t.type === 'Expense');

    const categoryMap = {};
    expenses.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryMap)
        .map(function(entry) { return { category: entry[0], amount: entry[1] }; })
        .sort(function(a, b) { return b.amount - a.amount; })
        .slice(0, count);
};

// Get daily average spending this month
export const getDailyAverage = (transactions) => {
    const now = new Date();
    const monthTxns = getMonthTransactions(transactions, now.getFullYear(), now.getMonth());
    const expenses = monthTxns
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const daysElapsed = now.getDate();

    return daysElapsed > 0 ? Math.round(expenses / daysElapsed) : 0;
};

// Predict end-of-month spending
export const predictEndOfMonth = (transactions, budget) => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - now.getDate();
    const dailyAvg = getDailyAverage(transactions);
    const summary = getCurrentMonthSummary(transactions);
    const predictedExpenses = summary.expenses + (dailyAvg * daysRemaining);

    return {
        predictedExpenses: Math.round(predictedExpenses),
        daysRemaining: daysRemaining,
        dailyAverage: dailyAvg,
        willExceedBudget: budget > 0 && predictedExpenses > budget,
    };
};

// Get overspending alerts
export const getOverspendingAlerts = (transactions, budget) => {
    var alerts = [];
    var summary = getCurrentMonthSummary(transactions);

    if (budget > 0) {
        var percentage = (summary.expenses / budget) * 100;

        if (percentage >= 100) {
            alerts.push({
                type: 'danger',
                message: 'Budget exceeded! You\'ve spent \u20B9' + (summary.expenses - budget).toLocaleString('en-IN') + ' over your \u20B9' + budget.toLocaleString('en-IN') + ' budget.',
            });
        } else if (percentage >= 80) {
            alerts.push({
                type: 'warning',
                message: Math.round(percentage) + '% of your monthly budget used. \u20B9' + (budget - summary.expenses).toLocaleString('en-IN') + ' remaining.',
            });
        }
    }

    return alerts;
};

// Smart saving suggestions
export const getSavingSuggestions = (transactions, budget) => {
    var suggestions = [];
    var topCategories = getTopCategories(transactions, 3);
    var summary = getCurrentMonthSummary(transactions);
    var prediction = predictEndOfMonth(transactions, budget);

    // Top spending category insight
    if (topCategories.length > 0) {
        var top = topCategories[0];
        var percentage = summary.expenses > 0 ? Math.round((top.amount / summary.expenses) * 100) : 0;
        suggestions.push({
            icon: '\uD83D\uDCCA',
            title: top.category + ' is your biggest expense',
            description: 'You\'ve spent \u20B9' + top.amount.toLocaleString('en-IN') + ' (' + percentage + '% of total) on ' + top.category + '. Consider setting a category limit.',
        });
    }

    // Budget suggestion
    if (budget > 0) {
        var utilization = (summary.expenses / budget) * 100;
        if (utilization > 90) {
            suggestions.push({
                icon: '\uD83D\uDEA8',
                title: 'Budget almost exhausted!',
                description: 'You\'ve used ' + Math.round(utilization) + '% of your monthly budget with ' + prediction.daysRemaining + ' days remaining. Minimize non-essential spending.',
            });
        } else if (utilization > 70) {
            suggestions.push({
                icon: '\u26A0\uFE0F',
                title: 'Budget usage is high',
                description: Math.round(utilization) + '% of budget used with ' + prediction.daysRemaining + ' days left. Plan your remaining expenses carefully.',
            });
        } else {
            suggestions.push({
                icon: '\u2705',
                title: 'Good budget management!',
                description: 'Only ' + Math.round(utilization) + '% used. You\'re on track to save \u20B9' + (budget - summary.expenses).toLocaleString('en-IN') + ' this month.',
            });
        }
    } else {
        suggestions.push({
            icon: '\uD83D\uDCB0',
            title: 'Set a monthly budget',
            description: 'Setting a budget helps you stay aware of your spending limits and save more effectively.',
        });
    }

    // Savings rate
    if (summary.income > 0) {
        var savingsRate = ((summary.income - summary.expenses) / summary.income) * 100;
        if (savingsRate < 20) {
            suggestions.push({
                icon: '\uD83D\uDCA1',
                title: 'Low savings rate: ' + Math.round(savingsRate) + '%',
                description: 'Financial experts recommend saving at least 20% of income. Try reducing discretionary spending.',
            });
        } else {
            suggestions.push({
                icon: '\uD83C\uDFAF',
                title: 'Great savings rate: ' + Math.round(savingsRate) + '%',
                description: 'You\'re saving \u20B9' + (summary.income - summary.expenses).toLocaleString('en-IN') + ' this month. Keep it up!',
            });
        }
    }

    // Prediction warning
    if (prediction.willExceedBudget) {
        suggestions.push({
            icon: '\uD83D\uDCC8',
            title: 'Overspending predicted',
            description: 'At current rate, you\'ll spend \u20B9' + prediction.predictedExpenses.toLocaleString('en-IN') + ' by month end, exceeding budget by \u20B9' + (prediction.predictedExpenses - budget).toLocaleString('en-IN') + '.',
        });
    }

    // Daily safe spend
    if (budget > 0 && prediction.daysRemaining > 0) {
        var dailySafe = Math.max(0, Math.round((budget - summary.expenses) / prediction.daysRemaining));
        suggestions.push({
            icon: '\uD83D\uDCC5',
            title: 'Daily safe spend: \u20B9' + dailySafe.toLocaleString('en-IN'),
            description: 'To stay within budget, limit daily spending to \u20B9' + dailySafe.toLocaleString('en-IN') + ' for the remaining ' + prediction.daysRemaining + ' days.',
        });
    }

    // Food pattern
    var foodCat = topCategories.find(function(c) { return c.category === 'Food'; });
    if (foodCat && summary.expenses > 0 && (foodCat.amount / summary.expenses) > 0.3) {
        suggestions.push({
            icon: '\uD83C\uDF54',
            title: 'High food expenses',
            description: 'Food accounts for ' + Math.round((foodCat.amount / summary.expenses) * 100) + '% of spending. Try meal prepping or cooking at home to reduce costs.',
        });
    }

    return suggestions;
};

// Month-over-month comparison
export const getMonthComparison = (transactions) => {
    var now = new Date();
    var currentSummary = getCurrentMonthSummary(transactions);

    var prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    var prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    var prevMonthTxns = getMonthTransactions(transactions, prevYear, prevMonthIdx);

    var prevExpenses = prevMonthTxns.filter(function(t) { return t.type === 'Expense'; }).reduce(function(sum, t) { return sum + t.amount; }, 0);
    var prevIncome = prevMonthTxns.filter(function(t) { return t.type === 'Income'; }).reduce(function(sum, t) { return sum + t.amount; }, 0);

    return {
        currentExpenses: currentSummary.expenses,
        previousExpenses: prevExpenses,
        currentIncome: currentSummary.income,
        previousIncome: prevIncome,
        expenseChange: prevExpenses > 0 ? Math.round(((currentSummary.expenses - prevExpenses) / prevExpenses) * 100) : 0,
        incomeChange: prevIncome > 0 ? Math.round(((currentSummary.income - prevIncome) / prevIncome) * 100) : 0,
    };
};
