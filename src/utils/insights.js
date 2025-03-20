/**
 * Spending Analysis & Insights Engine
 * Provides meaningful financial insights from transaction data.
 * All amounts in INR (₹)
 */

// Get transactions for a specific month
export var getMonthTransactions = function (transactions, year, month) {
    return transactions.filter(function (t) {
        var d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
};

// Get current month summary
export var getCurrentMonthSummary = function (transactions) {
    var now = new Date();
    var monthTxns = getMonthTransactions(transactions, now.getFullYear(), now.getMonth());

    var incomeTxns = monthTxns.filter(function (t) { return t.type === 'Income'; });
    var expenseTxns = monthTxns.filter(function (t) { return t.type === 'Expense'; });

    var income = incomeTxns.reduce(function (sum, t) { return sum + t.amount; }, 0);
    var expenses = expenseTxns.reduce(function (sum, t) { return sum + t.amount; }, 0);

    return {
        income: income,
        expenses: expenses,
        savings: income - expenses,
        transactions: monthTxns,
        incomeCount: incomeTxns.length,
        expenseCount: expenseTxns.length,
    };
};

// Get top spending categories this month
export var getTopCategories = function (transactions, limit) {
    var count = limit || 5;
    var now = new Date();
    var monthTxns = getMonthTransactions(transactions, now.getFullYear(), now.getMonth());
    var expenses = monthTxns.filter(function (t) { return t.type === 'Expense'; });

    var categoryMap = {};
    expenses.forEach(function (t) {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryMap)
        .map(function (entry) { return { category: entry[0], amount: entry[1] }; })
        .sort(function (a, b) { return b.amount - a.amount; })
        .slice(0, count);
};

// Get daily average spending this month
export var getDailyAverage = function (transactions) {
    var now = new Date();
    var monthTxns = getMonthTransactions(transactions, now.getFullYear(), now.getMonth());
    var expenses = monthTxns
        .filter(function (t) { return t.type === 'Expense'; })
        .reduce(function (sum, t) { return sum + t.amount; }, 0);
    var daysElapsed = now.getDate();

    return daysElapsed > 0 ? Math.round(expenses / daysElapsed) : 0;
};

// Predict end-of-month spending
export var predictEndOfMonth = function (transactions, budget) {
    var now = new Date();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var daysRemaining = daysInMonth - now.getDate();
    var dailyAvg = getDailyAverage(transactions);
    var summary = getCurrentMonthSummary(transactions);
    var predictedExpenses = summary.expenses + (dailyAvg * daysRemaining);

    return {
        predictedExpenses: Math.round(predictedExpenses),
        daysRemaining: daysRemaining,
        dailyAverage: dailyAvg,
        willExceedBudget: budget > 0 && predictedExpenses > budget,
    };
};

// Get overspending alerts
export var getOverspendingAlerts = function (transactions, budget) {
    var alerts = [];
    var summary = getCurrentMonthSummary(transactions);

    if (budget > 0) {
        var percentage = (summary.expenses / budget) * 100;

        if (percentage >= 100) {
            alerts.push({
                type: 'danger',
                message: 'Budget exceeded! You\'ve overspent by \u20B9' + (summary.expenses - budget).toLocaleString('en-IN') + '.',
            });
        } else if (percentage >= 80) {
            alerts.push({
                type: 'warning',
                message: Math.round(percentage) + '% of budget used. Only \u20B9' + (budget - summary.expenses).toLocaleString('en-IN') + ' remaining.',
            });
        }
    }

    return alerts;
};

// Smart saving suggestions — now uses monthlyIncome and lockedSavings
export var getSavingSuggestions = function (transactions, budget, monthlyIncome, lockedSavings) {
    var suggestions = [];
    var topCategories = getTopCategories(transactions, 3);
    var summary = getCurrentMonthSummary(transactions);
    var prediction = predictEndOfMonth(transactions, budget);
    var remaining = budget - summary.expenses;

    // Top spending category insight
    if (topCategories.length > 0) {
        var top = topCategories[0];
        var percentage = summary.expenses > 0 ? Math.round((top.amount / summary.expenses) * 100) : 0;
        suggestions.push({
            icon: '\uD83D\uDCCA',
            title: top.category + ' is your biggest expense (' + percentage + '%)',
            description: 'You\'ve spent \u20B9' + top.amount.toLocaleString('en-IN') + ' on ' + top.category + ' this month. Consider if you can reduce this.',
        });
    }

    // Budget status
    if (budget > 0) {
        var utilization = (summary.expenses / budget) * 100;
        if (utilization > 90) {
            suggestions.push({
                icon: '\uD83D\uDEA8',
                title: 'Budget almost exhausted!',
                description: Math.round(utilization) + '% used with ' + prediction.daysRemaining + ' days remaining. Cut non-essential spending.',
            });
        } else if (utilization > 70) {
            suggestions.push({
                icon: '\u26A0\uFE0F',
                title: 'Budget usage is high (' + Math.round(utilization) + '%)',
                description: '\u20B9' + Math.round(remaining).toLocaleString('en-IN') + ' left for ' + prediction.daysRemaining + ' days. That\'s \u20B9' + (prediction.daysRemaining > 0 ? Math.round(remaining / prediction.daysRemaining) : 0).toLocaleString('en-IN') + '/day.',
            });
        } else if (utilization > 0) {
            suggestions.push({
                icon: '\u2705',
                title: 'On track! ' + Math.round(utilization) + '% of budget used',
                description: 'You have \u20B9' + Math.round(remaining).toLocaleString('en-IN') + ' left. Keep up the good spending habits!',
            });
        }
    }

    // Savings feedback
    if (monthlyIncome > 0 && lockedSavings > 0) {
        var effectiveSavings = lockedSavings + Math.max(0, remaining);
        var savingsRate = Math.round((effectiveSavings / monthlyIncome) * 100);
        if (savingsRate >= 30) {
            suggestions.push({
                icon: '\uD83C\uDFAF',
                title: 'Excellent savings rate: ' + savingsRate + '%',
                description: 'You\'re saving \u20B9' + effectiveSavings.toLocaleString('en-IN') + ' this month (\u20B9' + lockedSavings.toLocaleString('en-IN') + ' locked + \u20B9' + Math.max(0, remaining).toLocaleString('en-IN') + ' unspent).',
            });
        } else if (savingsRate >= 20) {
            suggestions.push({
                icon: '\uD83D\uDCA1',
                title: 'Good savings rate: ' + savingsRate + '%',
                description: 'Your locked savings of \u20B9' + lockedSavings.toLocaleString('en-IN') + ' are safe. Try to keep some unspent budget too.',
            });
        }
    }

    // Daily spending tip
    if (budget > 0 && prediction.daysRemaining > 0 && remaining > 0) {
        var dailySafe = Math.round(remaining / prediction.daysRemaining);
        suggestions.push({
            icon: '\uD83D\uDCC5',
            title: 'Daily safe spend: \u20B9' + dailySafe.toLocaleString('en-IN'),
            description: 'To stay within budget for the remaining ' + prediction.daysRemaining + ' days, spend no more than \u20B9' + dailySafe.toLocaleString('en-IN') + ' per day.',
        });
    }

    // Prediction
    if (prediction.willExceedBudget) {
        suggestions.push({
            icon: '\uD83D\uDCC8',
            title: 'Overspending predicted!',
            description: 'At \u20B9' + prediction.dailyAverage.toLocaleString('en-IN') + '/day, you\'ll spend \u20B9' + prediction.predictedExpenses.toLocaleString('en-IN') + ' total — \u20B9' + (prediction.predictedExpenses - budget).toLocaleString('en-IN') + ' over budget.',
        });
    }

    return suggestions;
};

// Month-over-month comparison
export var getMonthComparison = function (transactions) {
    var now = new Date();
    var currentSummary = getCurrentMonthSummary(transactions);

    var prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    var prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    var prevMonthTxns = getMonthTransactions(transactions, prevYear, prevMonthIdx);

    var prevExpenses = prevMonthTxns.filter(function (t) { return t.type === 'Expense'; }).reduce(function (sum, t) { return sum + t.amount; }, 0);
    var prevIncome = prevMonthTxns.filter(function (t) { return t.type === 'Income'; }).reduce(function (sum, t) { return sum + t.amount; }, 0);

    return {
        currentExpenses: currentSummary.expenses,
        previousExpenses: prevExpenses,
        currentIncome: currentSummary.income,
        previousIncome: prevIncome,
        expenseChange: prevExpenses > 0 ? Math.round(((currentSummary.expenses - prevExpenses) / prevExpenses) * 100) : 0,
        incomeChange: prevIncome > 0 ? Math.round(((currentSummary.income - prevIncome) / prevIncome) * 100) : 0,
    };
};
