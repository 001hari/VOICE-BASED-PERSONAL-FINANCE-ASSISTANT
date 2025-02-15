import React, { useReducer, createContext } from 'react';
import contextReducer from './contextReducer';

const initialTransactions = JSON.parse(localStorage.getItem('transactions')) || [
    { amount: 45000, category: 'Salary', type: 'Income', date: '2026-04-01', id: 'demo-1' },
    { amount: 5000, category: 'Extra income', type: 'Income', date: '2026-04-05', id: 'demo-2' },
    { amount: 2000, category: 'Investments', type: 'Income', date: '2026-04-10', id: 'demo-3' },
    { amount: 1500, category: 'Food', type: 'Expense', date: '2026-04-02', id: 'demo-4' },
    { amount: 3500, category: 'Bills', type: 'Expense', date: '2026-04-03', id: 'demo-5' },
    { amount: 2000, category: 'Travel', type: 'Expense', date: '2026-04-07', id: 'demo-6' },
    { amount: 4000, category: 'Shopping', type: 'Expense', date: '2026-04-09', id: 'demo-7' },
    { amount: 800, category: 'Entertainment', type: 'Expense', date: '2026-04-12', id: 'demo-8' },
    { amount: 1200, category: 'Food', type: 'Expense', date: '2026-04-14', id: 'demo-9' },
    { amount: 500, category: 'Phone', type: 'Expense', date: '2026-04-05', id: 'demo-10' },
];

const initialBudget = JSON.parse(localStorage.getItem('budget')) || 25000;

const initialGoals = JSON.parse(localStorage.getItem('goals')) || [
    { id: 'goal-1', title: 'Emergency Fund', targetAmount: 100000, savedAmount: 35000, createdDate: '2026-01-01' },
    { id: 'goal-2', title: 'New Laptop', targetAmount: 60000, savedAmount: 15000, createdDate: '2026-03-01' },
];

const initialState = {
    transactions: initialTransactions,
    budget: initialBudget,
    goals: initialGoals,
};

export const ExpenseTrackerContext = createContext(initialState);

export const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(contextReducer, initialState);

    // Actions
    const addTransaction = (transaction) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    };

    const deleteTransaction = (id) => {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    };

    const setBudget = (amount) => {
        dispatch({ type: 'SET_BUDGET', payload: amount });
    };

    const addGoal = (goal) => {
        dispatch({ type: 'ADD_GOAL', payload: goal });
    };

    const updateGoal = (goal) => {
        dispatch({ type: 'UPDATE_GOAL', payload: goal });
    };

    const deleteGoal = (id) => {
        dispatch({ type: 'DELETE_GOAL', payload: id });
    };

    // Computed
    const balance = state.transactions.reduce(
        (acc, t) => (t.type === 'Expense' ? acc - t.amount : acc + t.amount),
        0
    );

    return (
        <ExpenseTrackerContext.Provider value={{
            transactions: state.transactions,
            budget: state.budget,
            goals: state.goals,
            balance,
            addTransaction,
            deleteTransaction,
            setBudget,
            addGoal,
            updateGoal,
            deleteGoal,
        }}>
            {children}
        </ExpenseTrackerContext.Provider>
    );
};