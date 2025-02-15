import React, { useContext } from 'react';
import { ExpenseTrackerContext } from '../../context/context';
import {
    getCurrentMonthSummary,
    getTopCategories,
    getDailyAverage,
    predictEndOfMonth,
    getSavingSuggestions,
    getMonthComparison,
} from '../../utils/insights';
import './Insights.css';

var Insights = function () {
    var context = useContext(ExpenseTrackerContext);
    var transactions = context.transactions;
    var budget = context.budget;

    var summary = getCurrentMonthSummary(transactions);
    var topCategories = getTopCategories(transactions, 5);
    var dailyAvg = getDailyAverage(transactions);
    var prediction = predictEndOfMonth(transactions, budget);
    var suggestions = getSavingSuggestions(transactions, budget);
    var comparison = getMonthComparison(transactions);

    var now = new Date();
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    var currentMonthName = monthNames[now.getMonth()];
    var prevMonthName = now.getMonth() === 0 ? monthNames[11] : monthNames[now.getMonth() - 1];

    return (
        <div className="insights-page">
            {/* Monthly Summary */}
            <div className="card fade-in">
                <span className="label">{currentMonthName} Summary</span>
                <div className="summary-grid">
                    <div className="summary-item">
                        <span className="summary-value amount-income mono">
                            {'\u20B9'}{summary.income.toLocaleString('en-IN')}
                        </span>
                        <span className="summary-label">Income</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value amount-expense mono">
                            {'\u20B9'}{summary.expenses.toLocaleString('en-IN')}
                        </span>
                        <span className="summary-label">Expenses</span>
                    </div>
                    <div className="summary-item">
                        <span className={'summary-value mono ' + (summary.savings >= 0 ? 'amount-income' : 'amount-expense')}>
                            {'\u20B9'}{Math.abs(summary.savings).toLocaleString('en-IN')}
                        </span>
                        <span className="summary-label">{summary.savings >= 0 ? 'Saved' : 'Deficit'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value mono">
                            {'\u20B9'}{dailyAvg.toLocaleString('en-IN')}
                        </span>
                        <span className="summary-label">Daily Avg</span>
                    </div>
                </div>
            </div>

            {/* Month Comparison */}
            <div className="card fade-in">
                <span className="label">vs {prevMonthName}</span>
                <div className="comparison-grid">
                    <div className="comparison-item">
                        <span className="comparison-label">Expenses</span>
                        <div className="comparison-values">
                            <span className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                                {'\u20B9'}{summary.expenses.toLocaleString('en-IN')}
                            </span>
                            {comparison.previousExpenses > 0 && (
                                <span className={'comparison-change ' + (comparison.expenseChange > 0 ? 'change-up' : 'change-down')}>
                                    {comparison.expenseChange > 0 ? '\u2191' : '\u2193'} {Math.abs(comparison.expenseChange)}%
                                </span>
                            )}
                        </div>
                        {comparison.previousExpenses > 0 && (
                            <span className="stat-sub">Was {'\u20B9'}{comparison.previousExpenses.toLocaleString('en-IN')}</span>
                        )}
                        {comparison.previousExpenses === 0 && (
                            <span className="stat-sub">No data for {prevMonthName}</span>
                        )}
                    </div>
                    <div className="comparison-item">
                        <span className="comparison-label">Income</span>
                        <div className="comparison-values">
                            <span className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                                {'\u20B9'}{summary.income.toLocaleString('en-IN')}
                            </span>
                            {comparison.previousIncome > 0 && (
                                <span className={'comparison-change ' + (comparison.incomeChange >= 0 ? 'change-good' : 'change-bad')}>
                                    {comparison.incomeChange >= 0 ? '\u2191' : '\u2193'} {Math.abs(comparison.incomeChange)}%
                                </span>
                            )}
                        </div>
                        {comparison.previousIncome > 0 && (
                            <span className="stat-sub">Was {'\u20B9'}{comparison.previousIncome.toLocaleString('en-IN')}</span>
                        )}
                        {comparison.previousIncome === 0 && (
                            <span className="stat-sub">No data for {prevMonthName}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card fade-in">
                <span className="label">Expense Breakdown</span>
                {topCategories.length > 0 ? (
                    <div className="breakdown-list">
                        {topCategories.map(function (cat) {
                            var pct = summary.expenses > 0 ? Math.round((cat.amount / summary.expenses) * 100) : 0;
                            return (
                                <div key={cat.category} className="breakdown-item">
                                    <div className="breakdown-info">
                                        <span className="breakdown-name">{cat.category}</span>
                                        <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>
                                            {'\u20B9'}{cat.amount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="breakdown-bar-track">
                                        <div className="breakdown-bar-fill" style={{ width: pct + '%' }}></div>
                                    </div>
                                    <span className="stat-sub">{pct}% of total</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-data">No expense data available</p>
                )}
            </div>

            {/* Prediction */}
            <div className="card fade-in">
                <span className="label">Forecast</span>
                <div className="forecast-grid">
                    <div className="forecast-item">
                        <span className="forecast-value mono" style={{
                            color: prediction.willExceedBudget ? 'var(--expense)' : 'var(--text)',
                        }}>
                            {'\u20B9'}{prediction.predictedExpenses.toLocaleString('en-IN')}
                        </span>
                        <span className="stat-sub">Predicted expenses by month end</span>
                    </div>
                    <div className="forecast-item">
                        <span className="forecast-value mono">
                            {prediction.daysRemaining}
                        </span>
                        <span className="stat-sub">Days remaining</span>
                    </div>
                    <div className="forecast-item">
                        <span className="forecast-value mono">
                            {'\u20B9'}{dailyAvg.toLocaleString('en-IN')}
                        </span>
                        <span className="stat-sub">Average daily spend</span>
                    </div>
                    {budget > 0 && prediction.daysRemaining > 0 && (
                        <div className="forecast-item">
                            <span className="forecast-value mono" style={{
                                color: (budget - summary.expenses) > 0 ? 'var(--income)' : 'var(--expense)',
                            }}>
                                {'\u20B9'}{Math.max(0, Math.round((budget - summary.expenses) / prediction.daysRemaining)).toLocaleString('en-IN')}
                            </span>
                            <span className="stat-sub">Safe daily spend</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Suggestions */}
            <div className="card fade-in">
                <span className="label">Smart Suggestions</span>
                {suggestions.length > 0 ? (
                    <div className="suggestions-list">
                        {suggestions.map(function (s, i) {
                            return (
                                <div key={i} className="suggestion-item">
                                    <span className="suggestion-icon">{s.icon}</span>
                                    <div className="suggestion-content">
                                        <span className="suggestion-title">{s.title}</span>
                                        <span className="suggestion-desc">{s.description}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-data">Add more transactions to get personalized suggestions</p>
                )}
            </div>
        </div>
    );
};

export default Insights;
