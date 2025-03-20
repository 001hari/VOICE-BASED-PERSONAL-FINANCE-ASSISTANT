// Distinct rainbow colors for expense categories — each clearly different
const expenseColors = [
    '#FF6384', // Bills - pink
    '#36A2EB', // Car - blue
    '#FFCE56', // Clothes - gold
    '#4BC0C0', // Travel - teal
    '#FF9F40', // Food - orange
    '#9966FF', // Shopping - purple
    '#FF6633', // House - coral
    '#2ECC71', // Entertainment - green
    '#3498DB', // Phone - steel blue
    '#E74C3C', // Pets - crimson
    '#95A5A6', // Other - grey
];

// Varied colors for income categories
const incomeColors = [
    '#1ABC9C', // Business - turquoise
    '#2980B9', // Investments - blue
    '#8E44AD', // Extra income - purple
    '#16A085', // Deposits - dark turquoise
    '#F39C12', // Lottery - gold
    '#D35400', // Gifts - orange
    '#27AE60', // Salary - green
    '#2C3E50', // Savings - dark navy
    '#7F8C8D', // Rental income - grey
];

export const incomeCategories = [
    { type: 'Business', amount: 0, color: incomeColors[0] },
    { type: 'Investments', amount: 0, color: incomeColors[1] },
    { type: 'Extra income', amount: 0, color: incomeColors[2] },
    { type: 'Deposits', amount: 0, color: incomeColors[3] },
    { type: 'Lottery', amount: 0, color: incomeColors[4] },
    { type: 'Gifts', amount: 0, color: incomeColors[5] },
    { type: 'Salary', amount: 0, color: incomeColors[6] },
    { type: 'Savings', amount: 0, color: incomeColors[7] },
    { type: 'Rental income', amount: 0, color: incomeColors[8] },
];

export const expenseCategories = [
    { type: 'Bills', amount: 0, color: expenseColors[0] },
    { type: 'Car', amount: 0, color: expenseColors[1] },
    { type: 'Clothes', amount: 0, color: expenseColors[2] },
    { type: 'Travel', amount: 0, color: expenseColors[3] },
    { type: 'Food', amount: 0, color: expenseColors[4] },
    { type: 'Shopping', amount: 0, color: expenseColors[5] },
    { type: 'House', amount: 0, color: expenseColors[6] },
    { type: 'Entertainment', amount: 0, color: expenseColors[7] },
    { type: 'Phone', amount: 0, color: expenseColors[8] },
    { type: 'Pets', amount: 0, color: expenseColors[9] },
    { type: 'Other', amount: 0, color: expenseColors[10] },
];

export const resetCategories = () => {
    incomeCategories.forEach((c) => c.amount = 0);
    expenseCategories.forEach((c) => c.amount = 0);
};