import React, { useState, useContext } from 'react';
import { ExpenseTrackerContext } from '../../context/context';
import { getCurrentMonthSummary, predictEndOfMonth } from '../../utils/insights';
import './Advisor.css';

var questionTemplates = [
    {
        id: 'spend',
        icon: '\uD83D\uDED2',
        label: 'Can I afford this purchase?',
        prefix: 'I want to spend',
        reasonLabel: 'What for?',
        reasonPlaceholder: 'e.g. new shoes, dinner, groceries',
        showDate: false,
    },
    {
        id: 'lend',
        icon: '\uD83E\uDD1D',
        label: 'Can I lend money to someone?',
        prefix: 'I want to lend',
        reasonLabel: 'To whom?',
        reasonPlaceholder: 'e.g. my friend Rahul',
        showDate: false,
    },
    {
        id: 'plan',
        icon: '\uD83D\uDCC5',
        label: 'Can I spend on a specific date?',
        prefix: 'I need to spend',
        reasonLabel: 'What for?',
        reasonPlaceholder: 'e.g. birthday party, trip',
        showDate: true,
    },
    {
        id: 'save',
        icon: '\uD83C\uDFF7\uFE0F',
        label: 'Can I save extra this month?',
        prefix: 'I want to save an extra',
        reasonLabel: 'Saving for?',
        reasonPlaceholder: 'e.g. emergency fund, vacation',
        showDate: false,
    },
];

var Advisor = function () {
    var ctx = useContext(ExpenseTrackerContext);
    var transactions = ctx.transactions;
    var monthlyIncome = ctx.monthlyIncome;
    var spendableBudget = ctx.spendableBudget;
    var lockedSavings = ctx.lockedSavings;

    var selectedState = useState('spend');
    var selectedId = selectedState[0];
    var setSelectedId = selectedState[1];

    var amountState = useState('');
    var amount = amountState[0];
    var setAmount = amountState[1];

    var reasonState = useState('');
    var reason = reasonState[0];
    var setReason = reasonState[1];

    var responseState = useState(null);
    var response = responseState[0];
    var setResponse = responseState[1];

    var selectedQ = questionTemplates.find(function (q) { return q.id === selectedId; });

    var summary = getCurrentMonthSummary(transactions);
    var prediction = predictEndOfMonth(transactions, spendableBudget);
    var remaining = spendableBudget - summary.expenses;
    var dailySafe = prediction.daysRemaining > 0 ? Math.round(remaining / prediction.daysRemaining) : 0;

    var analyze = function () {
        var amt = parseInt(amount);
        if (!amt || amt <= 0) return;

        var reasonText = reason || 'this';
        var result = {};

        if (selectedId === 'save') {
            // Can I save extra?
            if (amt <= remaining) {
                result = {
                    canDo: true,
                    emoji: '\u2705',
                    headline: 'Yes, you can save an extra \u20B9' + amt.toLocaleString('en-IN') + '!',
                    details: [
                        'You have \u20B9' + remaining.toLocaleString('en-IN') + ' remaining in your budget.',
                        'After saving, you\'ll have \u20B9' + (remaining - amt).toLocaleString('en-IN') + ' left to spend.',
                        'Total savings this month: \u20B9' + (lockedSavings + amt).toLocaleString('en-IN'),
                    ],
                };
            } else {
                result = {
                    canDo: false,
                    emoji: '\u26A0\uFE0F',
                    headline: 'That\'s more than your remaining budget.',
                    details: [
                        'You have \u20B9' + remaining.toLocaleString('en-IN') + ' left to spend this month.',
                        'You can save up to \u20B9' + Math.max(0, remaining).toLocaleString('en-IN') + ' extra.',
                        'Your locked savings of \u20B9' + lockedSavings.toLocaleString('en-IN') + ' are already secured.',
                    ],
                };
            }
        } else {
            // Spend or lend
            if (amt <= remaining) {
                var newRemaining = remaining - amt;
                var newDailySafe = prediction.daysRemaining > 0 ? Math.round(newRemaining / prediction.daysRemaining) : 0;
                result = {
                    canDo: true,
                    emoji: '\u2705',
                    headline: 'Yes! You can afford \u20B9' + amt.toLocaleString('en-IN') + ' for ' + reasonText + '.',
                    details: [
                        'After this, you\'ll have \u20B9' + newRemaining.toLocaleString('en-IN') + ' left for the month.',
                        'Your daily safe spend will be \u20B9' + newDailySafe.toLocaleString('en-IN') + '/day (' + prediction.daysRemaining + ' days left).',
                        'Your savings of \u20B9' + lockedSavings.toLocaleString('en-IN') + ' remain untouched.',
                    ],
                };
            } else if (amt <= remaining + lockedSavings) {
                // Can afford but needs savings
                var fromSavings = amt - remaining;
                result = {
                    canDo: false,
                    emoji: '\uD83D\uDEA8',
                    headline: 'Not recommended. You\'d need to dip into savings.',
                    details: [
                        'You have \u20B9' + remaining.toLocaleString('en-IN') + ' in your spending budget.',
                        'You\'d need \u20B9' + fromSavings.toLocaleString('en-IN') + ' from your locked savings.',
                        'This would hurt your savings goal progress.',
                    ],
                    alternatives: [
                        'Spend \u20B9' + Math.round(remaining * 0.7).toLocaleString('en-IN') + ' now (70% of budget)',
                        'Split: \u20B9' + Math.round(amt / 2).toLocaleString('en-IN') + ' this month + \u20B9' + Math.round(amt / 2).toLocaleString('en-IN') + ' next month',
                        'Wait until next month when your budget resets',
                    ],
                };
            } else {
                // Can't afford at all
                result = {
                    canDo: false,
                    emoji: '\u274C',
                    headline: 'You can\'t afford \u20B9' + amt.toLocaleString('en-IN') + ' right now.',
                    details: [
                        'Your total remaining (budget + savings) is \u20B9' + (remaining + lockedSavings).toLocaleString('en-IN') + '.',
                        'This amount exceeds everything available.',
                    ],
                    alternatives: [
                        'Spend \u20B9' + Math.round(remaining * 0.5).toLocaleString('en-IN') + ' instead (50% of budget)',
                        'Save up over ' + Math.ceil(amt / lockedSavings) + ' months to accumulate this amount',
                        'Look for a more affordable alternative',
                    ],
                };
            }
        }

        setResponse(result);
    };

    var handleReset = function () {
        setAmount('');
        setReason('');
        setResponse(null);
    };

    return (
        <div className="advisor-page">
            <div className="advisor-header">
                <span className="label">Financial Advisor</span>
                <p className="advisor-subtitle">Ask me anything about your finances</p>
            </div>

            {/* Quick Stats */}
            <div className="advisor-stats">
                <div className="advisor-stat">
                    <span className="advisor-stat-label">Monthly Income</span>
                    <span className="mono advisor-stat-value">{'\u20B9'}{monthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="advisor-stat">
                    <span className="advisor-stat-label">Locked Savings</span>
                    <span className="mono advisor-stat-value" style={{ color: 'var(--income)' }}>
                        {'\u20B9'}{lockedSavings.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="advisor-stat">
                    <span className="advisor-stat-label">Remaining Budget</span>
                    <span className="mono advisor-stat-value" style={{ color: remaining >= 0 ? 'var(--text)' : 'var(--expense)' }}>
                        {'\u20B9'}{remaining.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="advisor-stat">
                    <span className="advisor-stat-label">Safe/Day</span>
                    <span className="mono advisor-stat-value">{'\u20B9'}{dailySafe.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* Question Selector */}
            <div className="card">
                <span className="label">Choose a question</span>
                <div className="question-grid">
                    {questionTemplates.map(function (q) {
                        return (
                            <button
                                key={q.id}
                                className={'question-btn ' + (selectedId === q.id ? 'active' : '')}
                                onClick={function () { setSelectedId(q.id); setResponse(null); }}
                            >
                                <span className="question-icon">{q.icon}</span>
                                <span className="question-label">{q.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Input Form */}
                <div className="advisor-form">
                    <p className="advisor-sentence">
                        <span className="advisor-prefix">{selectedQ.prefix}</span>
                    </p>
                    <div className="advisor-inputs">
                        <div className="form-group">
                            <label className="form-label">Amount ({'\u20B9'}) *</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={function (e) { setAmount(e.target.value); setResponse(null); }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{selectedQ.reasonLabel}</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={selectedQ.reasonPlaceholder}
                                value={reason}
                                onChange={function (e) { setReason(e.target.value); }}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-primary advisor-analyze-btn"
                        onClick={analyze}
                        disabled={!amount || parseInt(amount) <= 0}
                    >
                        <span className="dot" style={{ background: 'var(--white)' }}></span>
                        Analyze
                    </button>
                </div>
            </div>

            {/* Response */}
            {response && (
                <div className={'card advisor-response fade-in ' + (response.canDo ? 'response-positive' : 'response-negative')}>
                    <div className="response-header">
                        <span className="response-emoji">{response.emoji}</span>
                        <h3 className="response-headline">{response.headline}</h3>
                    </div>
                    <div className="response-details">
                        {response.details.map(function (d, i) {
                            return <p key={i} className="response-detail">{d}</p>;
                        })}
                    </div>
                    {response.alternatives && response.alternatives.length > 0 && (
                        <div className="response-alternatives">
                            <span className="label" style={{ marginBottom: 8 }}>Alternatives</span>
                            {response.alternatives.map(function (alt, i) {
                                return (
                                    <div key={i} className="alternative-item">
                                        <span className="alt-number mono">{i + 1}</span>
                                        <span>{alt}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <button className="btn btn-sm" onClick={handleReset} style={{ marginTop: 16 }}>
                        Ask Another Question
                    </button>
                </div>
            )}
        </div>
    );
};

export default Advisor;
