import React, { useContext, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ExpenseTrackerContext } from '../../context/context';
import useTransactions from '../../hooks/useTransactions';
import {
    getCurrentMonthSummary,
    getTopCategories,
    getDailyAverage,
    predictEndOfMonth,
    getOverspendingAlerts,
} from '../../utils/insights';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

var chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                font: { family: "'Inter', sans-serif", size: 11 },
                padding: 12,
                usePointStyle: true,
                pointStyleWidth: 8,
            },
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    return context.label + ': \u20B9' + context.raw.toLocaleString('en-IN');
                },
            },
        },
    },
    cutout: '65%',
};

var Dashboard = function () {
    var context = useContext(ExpenseTrackerContext);
    var transactions = context.transactions;
    var balance = context.balance;
    var budget = context.budget;
    var setBudget = context.setBudget;

    var incomeData = useTransactions('Income');
    var expenseData = useTransactions('Expense');

    var summary = getCurrentMonthSummary(transactions);
    var topCategories = getTopCategories(transactions, 3);
    var dailyAvg = getDailyAverage(transactions);
    var prediction = predictEndOfMonth(transactions, budget);
    var alerts = getOverspendingAlerts(transactions, budget);

    var budgetPercentage = budget > 0 ? Math.min((summary.expenses / budget) * 100, 100) : 0;
    var savingsRate = summary.income > 0
        ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
        : 0;

    var budgetBarColor = budgetPercentage > 90 ? 'var(--expense)' : budgetPercentage > 70 ? 'var(--warning)' : 'var(--income)';

    // Budget editing
    var storedEditState = useState(false);
    var isEditingBudget = storedEditState[0];
    var setIsEditingBudget = storedEditState[1];

    var storedBudgetInput = useState(budget.toString());
    var budgetInput = storedBudgetInput[0];
    var setBudgetInput = storedBudgetInput[1];

    var handleBudgetSave = function () {
        var val = parseInt(budgetInput);
        if (!isNaN(val) && val >= 0) {
            setBudget(val);
            setIsEditingBudget(false);
        }
    };

    return (
        <div className="dashboard">
            {/* Alerts */}
            {alerts.map(function (alert, i) {
                return (
                    <div key={i} className={'alert alert-' + alert.type}>
                        <span className="dot"></span>
                        <span>{alert.message}</span>
                    </div>
                );
            })}

            {/* Stat Cards */}
            <div className="grid-4">
                <div className="card stat-card fade-in stagger-1">
                    <span className="label">Total Balance</span>
                    <span className={'amount ' + (balance >= 0 ? 'amount-income' : 'amount-expense')} style={{ fontSize: 28 }}>
                        {'\u20B9'}{Math.abs(balance).toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub">{balance < 0 ? 'Deficit' : 'All time'}</span>
                </div>

                <div className="card stat-card fade-in stagger-2">
                    <span className="label">This Month Income</span>
                    <span className="amount amount-income" style={{ fontSize: 28 }}>
                        {'\u20B9'}{summary.income.toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub">{summary.incomeCount} transaction{summary.incomeCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="card stat-card fade-in stagger-3">
                    <span className="label">This Month Expenses</span>
                    <span className="amount amount-expense" style={{ fontSize: 28 }}>
                        {'\u20B9'}{summary.expenses.toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub">{'\u20B9'}{dailyAvg.toLocaleString('en-IN')}/day avg</span>
                </div>

                <div className="card stat-card fade-in stagger-4">
                    <span className="label">Savings Rate</span>
                    <span className="amount" style={{ fontSize: 28, color: savingsRate >= 20 ? 'var(--income)' : 'var(--expense)' }}>
                        {savingsRate}%
                    </span>
                    <span className="stat-sub">{savingsRate >= 20 ? '\u2713 Healthy' : '\u2191 Save more'}</span>
                </div>
            </div>

            {/* Budget Section */}
            <div className="card budget-section fade-in">
                <div className="budget-header">
                    <span className="label" style={{ marginBottom: 0 }}>Monthly Budget</span>
                    {!isEditingBudget ? (
                        <button className="btn btn-sm" onClick={function () { setIsEditingBudget(true); setBudgetInput(budget.toString()); }}>
                            {budget > 0 ? 'Edit' : 'Set Budget'}
                        </button>
                    ) : (
                        <div className="budget-edit">
                            <input
                                type="number"
                                className="form-input"
                                style={{ width: 120, padding: '6px 10px', fontSize: 13 }}
                                value={budgetInput}
                                onChange={function (e) { setBudgetInput(e.target.value); }}
                                placeholder="Amount"
                            />
                            <button className="btn btn-sm btn-primary" onClick={handleBudgetSave}>Save</button>
                            <button className="btn btn-sm" onClick={function () { setIsEditingBudget(false); }}>Cancel</button>
                        </div>
                    )}
                </div>
                {budget > 0 && (
                    <div className="budget-body">
                        <div className="budget-amounts">
                            <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                                {'\u20B9'}{summary.expenses.toLocaleString('en-IN')}
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {'\u20B9'}{budget.toLocaleString('en-IN')}</span>
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: budgetPercentage + '%', background: budgetBarColor }}></div>
                        </div>
                        <div className="budget-footer">
                            <span className="stat-sub">{'\u20B9'}{Math.max(0, budget - summary.expenses).toLocaleString('en-IN')} remaining</span>
                            <span className="stat-sub">{prediction.daysRemaining} days left</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="card chart-card fade-in">
                    <span className="label">Income by Category</span>
                    <span className="amount amount-income" style={{ fontSize: 20, marginBottom: 16 }}>
                        {'\u20B9'}{incomeData.total.toLocaleString('en-IN')}
                    </span>
                    {incomeData.chartData.labels && incomeData.chartData.labels.length > 0 ? (
                        <div className="chart-wrap">
                            <Doughnut data={incomeData.chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No income recorded</p>
                    )}
                </div>

                <div className="card chart-card fade-in">
                    <span className="label">Expenses by Category</span>
                    <span className="amount amount-expense" style={{ fontSize: 20, marginBottom: 16 }}>
                        {'\u20B9'}{expenseData.total.toLocaleString('en-IN')}
                    </span>
                    {expenseData.chartData.labels && expenseData.chartData.labels.length > 0 ? (
                        <div className="chart-wrap">
                            <Doughnut data={expenseData.chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No expenses recorded</p>
                    )}
                </div>
            </div>

            {/* Prediction & Top Spending */}
            <div className="grid-2">
                <div className="card fade-in">
                    <span className="label">End-of-Month Prediction</span>
                    <span className="amount" style={{
                        fontSize: 22,
                        color: prediction.willExceedBudget ? 'var(--expense)' : 'var(--text)',
                    }}>
                        {'\u20B9'}{prediction.predictedExpenses.toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub" style={{ marginTop: 8 }}>Predicted total expenses this month</span>
                    {prediction.daysRemaining > 0 && budget > 0 && (
                        <span className="stat-sub">
                            Safe daily spend: {'\u20B9'}{Math.max(0, Math.round((budget - summary.expenses) / prediction.daysRemaining)).toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                <div className="card fade-in">
                    <span className="label">Top Spending</span>
                    {topCategories.length > 0 ? (
                        <div className="top-categories">
                            {topCategories.map(function (cat, i) {
                                return (
                                    <div key={cat.category} className="top-cat-row">
                                        <span className="top-cat-rank mono">{i + 1}</span>
                                        <span className="top-cat-name">{cat.category}</span>
                                        <span className="mono amount-expense" style={{ fontSize: 14 }}>
                                            {'\u20B9'}{cat.amount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="no-data">No expenses yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
