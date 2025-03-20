import React, { useContext } from 'react';
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
    var ctx = useContext(ExpenseTrackerContext);
    var transactions = ctx.transactions;
    var monthlyIncome = ctx.monthlyIncome;
    var spendableBudget = ctx.spendableBudget;
    var lockedSavings = ctx.lockedSavings;
    var savingsPercentage = ctx.savingsPercentage;

    var incomeData = useTransactions('Income');
    var expenseData = useTransactions('Expense');

    var summary = getCurrentMonthSummary(transactions);
    var topCategories = getTopCategories(transactions, 5);
    var dailyAvg = getDailyAverage(transactions);
    var prediction = predictEndOfMonth(transactions, spendableBudget);
    var alerts = getOverspendingAlerts(transactions, spendableBudget);

    var spent = summary.expenses;
    var remaining = spendableBudget - spent;
    var budgetPercentage = spendableBudget > 0 ? Math.min((spent / spendableBudget) * 100, 100) : 0;
    var budgetBarColor = budgetPercentage > 90 ? 'var(--expense)' : budgetPercentage > 70 ? 'var(--warning)' : 'var(--income)';

    // Effective savings = locked + unspent budget
    var totalSaved = lockedSavings + Math.max(0, remaining);
    var savingsRate = monthlyIncome > 0 ? Math.round((totalSaved / monthlyIncome) * 100) : 0;

    // Daily safe spend
    var dailySafe = prediction.daysRemaining > 0 ? Math.max(0, Math.round(remaining / prediction.daysRemaining)) : 0;

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

            {/* Income Overview */}
            <div className="card income-overview fade-in">
                <div className="income-row">
                    <div className="income-item">
                        <span className="label" style={{ marginBottom: 4 }}>Monthly Income</span>
                        <span className="amount mono" style={{ fontSize: 24 }}>
                            {'\u20B9'}{monthlyIncome.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="income-split">
                        <div className="split-item">
                            <span className="split-label">Locked Savings ({savingsPercentage}%)</span>
                            <span className="mono split-value" style={{ color: 'var(--income)' }}>
                                {'\u20B9'}{lockedSavings.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="split-item">
                            <span className="split-label">Can Spend</span>
                            <span className="mono split-value" style={{ fontWeight: 700 }}>
                                {'\u20B9'}{spendableBudget.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid-4">
                <div className="card stat-card fade-in stagger-1">
                    <span className="label">Spent This Month</span>
                    <span className="amount amount-expense" style={{ fontSize: 24 }}>
                        {'\u20B9'}{spent.toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub">{summary.expenseCount} transaction{summary.expenseCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="card stat-card fade-in stagger-2">
                    <span className="label">Remaining</span>
                    <span className={'amount ' + (remaining >= 0 ? 'amount-income' : 'amount-expense')} style={{ fontSize: 24 }}>
                        {'\u20B9'}{Math.abs(remaining).toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub">{remaining < 0 ? 'Over budget!' : 'left to spend'}</span>
                </div>

                <div className="card stat-card fade-in stagger-3">
                    <span className="label">Safe/Day</span>
                    <span className="amount mono" style={{ fontSize: 24 }}>
                        {'\u20B9'}{dailySafe.toLocaleString('en-IN')}
                    </span>
                    <span className="stat-sub">{prediction.daysRemaining} days left</span>
                </div>

                <div className="card stat-card fade-in stagger-4">
                    <span className="label">Savings Rate</span>
                    <span className="amount" style={{ fontSize: 24, color: savingsRate >= 20 ? 'var(--income)' : 'var(--expense)' }}>
                        {savingsRate}%
                    </span>
                    <span className="stat-sub">{'\u20B9'}{totalSaved.toLocaleString('en-IN')} total saved</span>
                </div>
            </div>

            {/* Budget Progress */}
            <div className="card fade-in">
                <div className="budget-header">
                    <span className="label" style={{ marginBottom: 0 }}>Budget Usage</span>
                    <span className="mono" style={{ fontSize: 14 }}>
                        {'\u20B9'}{spent.toLocaleString('en-IN')} / {'\u20B9'}{spendableBudget.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="progress-bar" style={{ marginTop: 12 }}>
                    <div className="progress-fill" style={{ width: budgetPercentage + '%', background: budgetBarColor }}></div>
                </div>
                <div className="budget-footer">
                    <span className="stat-sub">{Math.round(budgetPercentage)}% used</span>
                    <span className="stat-sub">{prediction.daysRemaining} days remaining</span>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="card chart-card fade-in">
                    <span className="label">Income by Category</span>
                    <span className="amount amount-income" style={{ fontSize: 18, marginBottom: 12 }}>
                        {'\u20B9'}{incomeData.total.toLocaleString('en-IN')}
                    </span>
                    {incomeData.chartData.labels && incomeData.chartData.labels.length > 0 ? (
                        <div className="chart-wrap">
                            <Doughnut data={incomeData.chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No income transactions</p>
                    )}
                </div>

                <div className="card chart-card fade-in">
                    <span className="label">Expenses by Category</span>
                    <span className="amount amount-expense" style={{ fontSize: 18, marginBottom: 12 }}>
                        {'\u20B9'}{expenseData.total.toLocaleString('en-IN')}
                    </span>
                    {expenseData.chartData.labels && expenseData.chartData.labels.length > 0 ? (
                        <div className="chart-wrap">
                            <Doughnut data={expenseData.chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No expense transactions</p>
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
                    <span className="stat-sub" style={{ marginTop: 8 }}>
                        Predicted total expenses at {'\u20B9'}{dailyAvg.toLocaleString('en-IN')}/day
                    </span>
                    {prediction.willExceedBudget && (
                        <span className="stat-sub" style={{ color: 'var(--expense)', fontWeight: 600 }}>
                            {'\u26A0'} Will exceed budget by {'\u20B9'}{(prediction.predictedExpenses - spendableBudget).toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                <div className="card fade-in">
                    <span className="label">Top Spending</span>
                    {topCategories.length > 0 ? (
                        <div className="top-categories">
                            {topCategories.map(function (cat, i) {
                                var pct = spent > 0 ? Math.round((cat.amount / spent) * 100) : 0;
                                return (
                                    <div key={cat.category} className="top-cat-row">
                                        <span className="top-cat-rank mono">{i + 1}</span>
                                        <div className="top-cat-info">
                                            <span className="top-cat-name">{cat.category}</span>
                                            <span className="stat-sub">{pct}%</span>
                                        </div>
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

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <div className="card fade-in">
                    <span className="label">Recent Activity</span>
                    <div className="recent-txns">
                        {transactions.slice(0, 5).map(function (t) {
                            var isIncome = t.type === 'Income';
                            return (
                                <div key={t.id} className="recent-txn">
                                    <div className="recent-indicator" style={{
                                        background: isIncome ? 'var(--income)' : 'var(--expense)',
                                    }}></div>
                                    <div className="recent-info">
                                        <span className="recent-cat">{t.category}</span>
                                        <span className="stat-sub">{t.date}</span>
                                    </div>
                                    <span className={'mono ' + (isIncome ? 'amount-income' : 'amount-expense')} style={{ fontSize: 14, fontWeight: 700 }}>
                                        {isIncome ? '+' : '-'}{'\u20B9'}{t.amount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
