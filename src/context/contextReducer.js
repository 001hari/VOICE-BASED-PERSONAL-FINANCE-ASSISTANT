const contextReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TRANSACTION': {
            const transactions = [action.payload, ...state.transactions];
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return { ...state, transactions };
        }

        case 'DELETE_TRANSACTION': {
            const transactions = state.transactions.filter((t) => t.id !== action.payload);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return { ...state, transactions };
        }

        case 'SET_BUDGET': {
            localStorage.setItem('budget', JSON.stringify(action.payload));
            return { ...state, budget: action.payload };
        }

        case 'ADD_GOAL': {
            const goals = [...state.goals, action.payload];
            localStorage.setItem('goals', JSON.stringify(goals));
            return { ...state, goals };
        }

        case 'UPDATE_GOAL': {
            const goals = state.goals.map((g) =>
                g.id === action.payload.id ? { ...g, ...action.payload } : g
            );
            localStorage.setItem('goals', JSON.stringify(goals));
            return { ...state, goals };
        }

        case 'DELETE_GOAL': {
            const goals = state.goals.filter((g) => g.id !== action.payload);
            localStorage.setItem('goals', JSON.stringify(goals));
            return { ...state, goals };
        }

        case 'SET_MONTHLY_INCOME': {
            localStorage.setItem('monthlyIncome', JSON.stringify(action.payload));
            return { ...state, monthlyIncome: action.payload };
        }

        case 'SET_SAVINGS_PERCENTAGE': {
            localStorage.setItem('savingsPercentage', JSON.stringify(action.payload));
            return { ...state, savingsPercentage: action.payload };
        }

        case 'COMPLETE_ONBOARDING': {
            localStorage.setItem('onboardingComplete', 'true');
            return { ...state, onboardingComplete: true };
        }

        default:
            return state;
    }
};

export default contextReducer;