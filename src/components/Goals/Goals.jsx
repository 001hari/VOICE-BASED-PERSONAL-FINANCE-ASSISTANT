import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Delete from '@material-ui/icons/Delete';
import { ExpenseTrackerContext } from '../../context/context';
import './Goals.css';

var Goals = function () {
    var context = useContext(ExpenseTrackerContext);
    var goals = context.goals;
    var addGoal = context.addGoal;
    var updateGoal = context.updateGoal;
    var deleteGoal = context.deleteGoal;

    var showFormState = useState(false);
    var showForm = showFormState[0];
    var setShowForm = showFormState[1];

    var titleState = useState('');
    var title = titleState[0];
    var setTitle = titleState[1];

    var targetState = useState('');
    var target = targetState[0];
    var setTarget = targetState[1];

    var addAmountState = useState({});
    var addAmounts = addAmountState[0];
    var setAddAmounts = addAmountState[1];

    var handleCreate = function () {
        if (!title.trim() || !target || isNaN(parseInt(target))) return;
        addGoal({
            id: uuidv4(),
            title: title.trim(),
            targetAmount: parseInt(target),
            savedAmount: 0,
            createdDate: new Date().toISOString().slice(0, 10),
        });
        setTitle('');
        setTarget('');
        setShowForm(false);
    };

    var handleAddSavings = function (goalId) {
        var amt = parseInt(addAmounts[goalId]);
        if (!amt || isNaN(amt) || amt <= 0) return;
        var goal = goals.find(function (g) { return g.id === goalId; });
        if (goal) {
            updateGoal({ id: goalId, savedAmount: goal.savedAmount + amt });
            var newAmounts = { ...addAmounts };
            newAmounts[goalId] = '';
            setAddAmounts(newAmounts);
        }
    };

    var handleAmountChange = function (goalId, value) {
        var newAmounts = { ...addAmounts };
        newAmounts[goalId] = value;
        setAddAmounts(newAmounts);
    };

    return (
        <div className="goals-page">
            <div className="goals-header">
                <div>
                    <span className="label">Financial Goals</span>
                    <p className="goals-subtitle">Track your savings targets</p>
                </div>
                <button className="btn" onClick={function () { setShowForm(!showForm); }}>
                    {showForm ? 'Cancel' : '+ New Goal'}
                </button>
            </div>

            {/* New Goal Form */}
            {showForm && (
                <div className="card goal-form fade-in">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Goal Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Emergency Fund"
                                value={title}
                                onChange={function (e) { setTitle(e.target.value); }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Target Amount ({'\u20B9'})</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                value={target}
                                onChange={function (e) { setTarget(e.target.value); }}
                            />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate} style={{ marginTop: 16 }}>
                        Create Goal
                    </button>
                </div>
            )}

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="card">
                    <p className="no-data">No goals set yet. Create one to start tracking!</p>
                </div>
            ) : (
                <div className="goals-grid">
                    {goals.map(function (goal) {
                        var percentage = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
                        var remaining = goal.targetAmount - goal.savedAmount;
                        var isComplete = percentage >= 100;

                        return (
                            <div key={goal.id} className={'card goal-card fade-in ' + (isComplete ? 'goal-complete' : '')}>
                                <div className="goal-card-header">
                                    <div>
                                        <h3 className="goal-title">{goal.title}</h3>
                                        <span className="stat-sub">Created {goal.createdDate}</span>
                                    </div>
                                    <button
                                        className="btn-icon txn-delete"
                                        onClick={function () { deleteGoal(goal.id); }}
                                        title="Delete goal"
                                    >
                                        <Delete style={{ fontSize: 16 }} />
                                    </button>
                                </div>

                                <div className="goal-amounts">
                                    <span className="amount" style={{ fontSize: 22, color: isComplete ? 'var(--income)' : 'var(--text)' }}>
                                        {'\u20B9'}{goal.savedAmount.toLocaleString('en-IN')}
                                    </span>
                                    <span className="stat-sub">
                                        of {'\u20B9'}{goal.targetAmount.toLocaleString('en-IN')} ({percentage}%)
                                    </span>
                                </div>

                                <div className="progress-bar" style={{ height: 10 }}>
                                    <div className="progress-fill" style={{
                                        width: percentage + '%',
                                        background: isComplete ? 'var(--income)' : 'var(--accent)',
                                    }}></div>
                                </div>

                                {!isComplete && (
                                    <>
                                        <span className="stat-sub" style={{ marginTop: 8 }}>
                                            {'\u20B9'}{remaining.toLocaleString('en-IN')} remaining
                                        </span>
                                        <div className="goal-add-savings">
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="Add savings"
                                                value={addAmounts[goal.id] || ''}
                                                onChange={function (e) { handleAmountChange(goal.id, e.target.value); }}
                                                style={{ fontSize: 13, padding: '8px 10px' }}
                                            />
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={function () { handleAddSavings(goal.id); }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </>
                                )}

                                {isComplete && (
                                    <div className="goal-complete-badge">
                                        <span className="dot" style={{ background: 'var(--income)' }}></span>
                                        <span>Goal achieved!</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Goals;
