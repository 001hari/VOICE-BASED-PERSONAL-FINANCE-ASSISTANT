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

        default:
            return state;
    }
};

export default contextReducer;