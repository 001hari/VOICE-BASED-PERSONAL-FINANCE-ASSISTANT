import React, { useReducer, createContext } from 'react';
import contextReducer from './contextReducer';

// Data version — increment to clear stale localStorage
var DATA_VERSION = 3;
var storedVersion = localStorage.getItem('data_version');
if (storedVersion !== String(DATA_VERSION)) {
    localStorage.removeItem('transactions');
    localStorage.removeItem('budget');
    localStorage.removeItem('goals');
    localStorage.removeItem('monthlyIncome');
    localStorage.removeItem('savingsPercentage');
    localStorage.removeItem('onboardingComplete');
    localStorage.setItem('data_version', String(DATA_VERSION));
}

var initialTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
var initialBudget = JSON.parse(localStorage.getItem('budget')) || 0;
var initialGoals = JSON.parse(localStorage.getItem('goals')) || [];
var initialMonthlyIncome = JSON.parse(localStorage.getItem('monthlyIncome')) || 0;
var initialSavingsPercentage = JSON.parse(localStorage.getItem('savingsPercentage')) || 20;
var initialOnboarding = localStorage.getItem('onboardingComplete') === 'true';

var initialState = {
    transactions: initialTransactions,
    budget: initialBudget,
    goals: initialGoals,
    monthlyIncome: initialMonthlyIncome,
    savingsPercentage: initialSavingsPercentage,
    onboardingComplete: initialOnboarding,
};

export var ExpenseTrackerContext = createContext(initialState);

export var Provider = function (props) {
    var children = props.children;
    var result = useReducer(contextReducer, initialState);
    var state = result[0];
    var dispatch = result[1];

    // Actions
    var addTransaction = function (transaction) {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    };

    var deleteTransaction = function (id) {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    };

    var setBudget = function (amount) {
        dispatch({ type: 'SET_BUDGET', payload: amount });
    };

    var addGoal = function (goal) {
        dispatch({ type: 'ADD_GOAL', payload: goal });
    };

    var updateGoal = function (goal) {
        dispatch({ type: 'UPDATE_GOAL', payload: goal });
    };

    var deleteGoal = function (id) {
        dispatch({ type: 'DELETE_GOAL', payload: id });
    };

    var setMonthlyIncome = function (amount) {
        dispatch({ type: 'SET_MONTHLY_INCOME', payload: amount });
    };

    var setSavingsPercentage = function (pct) {
        dispatch({ type: 'SET_SAVINGS_PERCENTAGE', payload: pct });
    };

    var completeOnboarding = function () {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
    };

    // Computed values
    var balance = state.transactions.reduce(
        function (acc, t) { return t.type === 'Expense' ? acc - t.amount : acc + t.amount; },
        0
    );

    var lockedSavings = Math.round(state.monthlyIncome * state.savingsPercentage / 100);
    var spendableBudget = state.monthlyIncome - lockedSavings;

    return React.createElement(ExpenseTrackerContext.Provider, {
        value: {
            transactions: state.transactions,
            budget: state.budget,
            goals: state.goals,
            monthlyIncome: state.monthlyIncome,
            savingsPercentage: state.savingsPercentage,
            onboardingComplete: state.onboardingComplete,
            lockedSavings: lockedSavings,
            spendableBudget: spendableBudget,
            balance: balance,
            addTransaction: addTransaction,
            deleteTransaction: deleteTransaction,
            setBudget: setBudget,
            addGoal: addGoal,
            updateGoal: updateGoal,
            deleteGoal: deleteGoal,
            setMonthlyIncome: setMonthlyIncome,
            setSavingsPercentage: setSavingsPercentage,
            completeOnboarding: completeOnboarding,
        }
    }, children);
};