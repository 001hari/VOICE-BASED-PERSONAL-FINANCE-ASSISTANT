import { useContext } from 'react';
import { ExpenseTrackerContext } from '../context/context';
import { incomeCategories, expenseCategories } from '../constants/categories';

const useTransactions = (title) => {
    const { transactions } = useContext(ExpenseTrackerContext);
    const rightTransactions = transactions.filter((t) => t.type === title);
    const total = rightTransactions.reduce((acc, currVal) => acc + currVal.amount, 0);
    const categories = title === 'Income' ? incomeCategories : expenseCategories;

    // Aggregate amounts by category (no mutation of originals)
    const categoryAmounts = {};
    rightTransactions.forEach((t) => {
        categoryAmounts[t.category] = (categoryAmounts[t.category] || 0) + t.amount;
    });

    const filteredCategories = categories
        .map((c) => ({ ...c, amount: categoryAmounts[c.type] || 0 }))
        .filter((c) => c.amount > 0);

    const chartData = {
        datasets: [{
            data: filteredCategories.map((c) => c.amount),
            backgroundColor: filteredCategories.map((c) => c.color),
        }],
        labels: filteredCategories.map((c) => c.type),
    };

    return { filteredCategories, total, chartData };
};

export default useTransactions;
