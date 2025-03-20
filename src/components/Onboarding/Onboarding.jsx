import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ExpenseTrackerContext } from '../../context/context';
import formatDate from '../../utils/formatDate';
import './Onboarding.css';

var Onboarding = function () {
    var ctx = useContext(ExpenseTrackerContext);

    var stepState = useState(0);
    var step = stepState[0];
    var setStep = stepState[1];

    var incomeState = useState('');
    var income = incomeState[0];
    var setIncome = incomeState[1];

    var savingsState = useState(20);
    var savingsPct = savingsState[0];
    var setSavingsPct = savingsState[1];

    var goalNameState = useState('');
    var goalName = goalNameState[0];
    var setGoalName = goalNameState[1];

    var goalTargetState = useState('');
    var goalTarget = goalTargetState[0];
    var setGoalTarget = goalTargetState[1];

    var incomeNum = parseInt(income) || 0;
    var lockedSavings = Math.round(incomeNum * savingsPct / 100);
    var spendable = incomeNum - lockedSavings;

    var handleComplete = function () {
        if (incomeNum <= 0) return;

        // Set monthly income & savings
        ctx.setMonthlyIncome(incomeNum);
        ctx.setSavingsPercentage(savingsPct);

        // Auto-set budget to spendable amount
        ctx.setBudget(spendable);

        // Create salary transaction for this month
        ctx.addTransaction({
            amount: incomeNum,
            category: 'Salary',
            type: 'Income',
            date: formatDate(new Date()),
            id: uuidv4(),
        });

        // Create savings goal if user provided one
        if (goalName.trim() && goalTarget && parseInt(goalTarget) > 0) {
            ctx.addGoal({
                id: uuidv4(),
                title: goalName.trim(),
                targetAmount: parseInt(goalTarget),
                savedAmount: 0,
                createdDate: formatDate(new Date()),
            });
        }

        ctx.completeOnboarding();
    };

    var presets = [10, 15, 20, 25, 30];

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card">
                {/* Progress dots */}
                <div className="onboarding-progress">
                    <span className={'progress-dot ' + (step >= 0 ? 'active' : '')}></span>
                    <span className={'progress-dot ' + (step >= 1 ? 'active' : '')}></span>
                    <span className={'progress-dot ' + (step >= 2 ? 'active' : '')}></span>
                </div>

                {/* Step 0: Monthly Income */}
                {step === 0 && (
                    <div className="onboarding-step fade-in">
                        <div className="onboarding-icon">💰</div>
                        <h2 className="onboarding-title">Welcome to Personal Expense Tracker</h2>
                        <p className="onboarding-desc">Let's set up your finances. What's your monthly income?</p>
                        <div className="onboarding-input-group">
                            <span className="onboarding-currency">{'\u20B9'}</span>
                            <input
                                type="number"
                                className="onboarding-input"
                                placeholder="e.g. 50000"
                                value={income}
                                onChange={function (e) { setIncome(e.target.value); }}
                                autoFocus
                            />
                        </div>
                        <p className="onboarding-hint mono">This is your total salary or earnings per month</p>
                        <button
                            className="btn btn-primary onboarding-btn"
                            onClick={function () { if (incomeNum > 0) setStep(1); }}
                            disabled={incomeNum <= 0}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 1: Savings Percentage */}
                {step === 1 && (
                    <div className="onboarding-step fade-in">
                        <div className="onboarding-icon">🎯</div>
                        <h2 className="onboarding-title">How much do you want to save?</h2>
                        <p className="onboarding-desc">This amount will be locked — you won't be able to spend it.</p>

                        <div className="savings-presets">
                            {presets.map(function (pct) {
                                return (
                                    <button
                                        key={pct}
                                        className={'preset-btn ' + (savingsPct === pct ? 'active' : '')}
                                        onClick={function () { setSavingsPct(pct); }}
                                    >
                                        {pct}%
                                    </button>
                                );
                            })}
                        </div>

                        <div className="savings-summary">
                            <div className="savings-row">
                                <span>Monthly Income</span>
                                <span className="mono">{'\u20B9'}{incomeNum.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="savings-row">
                                <span>Locked Savings ({savingsPct}%)</span>
                                <span className="mono" style={{ color: 'var(--income)' }}>
                                    {'\u20B9'}{lockedSavings.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="savings-row savings-row-highlight">
                                <span>You Can Spend</span>
                                <span className="mono" style={{ fontWeight: 700, fontSize: 18 }}>
                                    {'\u20B9'}{spendable.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        <div className="onboarding-btns">
                            <button className="btn" onClick={function () { setStep(0); }}>Back</button>
                            <button className="btn btn-primary" onClick={function () { setStep(2); }}>Continue</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Savings Goal */}
                {step === 2 && (
                    <div className="onboarding-step fade-in">
                        <div className="onboarding-icon">🏆</div>
                        <h2 className="onboarding-title">Set a savings goal</h2>
                        <p className="onboarding-desc">What are you saving for? (optional)</p>

                        <div className="form-group" style={{ marginBottom: 12 }}>
                            <label className="form-label">Goal Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder='e.g. "New Watch", "Emergency Fund"'
                                value={goalName}
                                onChange={function (e) { setGoalName(e.target.value); }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Target Amount ({'\u20B9'})</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="e.g. 100000"
                                value={goalTarget}
                                onChange={function (e) { setGoalTarget(e.target.value); }}
                            />
                        </div>

                        {goalName && goalTarget && parseInt(goalTarget) > 0 && (
                            <div className="goal-preview fade-in">
                                <span className="dot"></span>
                                <span>
                                    At {'\u20B9'}{lockedSavings.toLocaleString('en-IN')}/month, you'll reach{' '}
                                    <strong>{goalName}</strong> in ~
                                    <strong>{Math.ceil(parseInt(goalTarget) / lockedSavings)} months</strong>
                                </span>
                            </div>
                        )}

                        <div className="onboarding-btns">
                            <button className="btn" onClick={function () { setStep(1); }}>Back</button>
                            <button className="btn btn-primary" onClick={handleComplete}>
                                <span className="dot" style={{ background: 'var(--white)' }}></span>
                                {goalName ? "Let's Go!" : 'Skip & Start'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
