import React, { useState, useContext } from 'react';
import { ExpenseTrackerContext } from './context/context';
import Onboarding from './components/Onboarding/Onboarding';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionForm from './components/TransactionForm/TransactionForm';
import TransactionList from './components/TransactionList/TransactionList';
import Goals from './components/Goals/Goals';
import Insights from './components/Insights/Insights';
import Advisor from './components/Advisor/Advisor';
import './App.css';

var tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'add', label: 'Add' },
    { id: 'advisor', label: 'Advisor' },
    { id: 'goals', label: 'Goals' },
    { id: 'insights', label: 'Insights' },
];

var App = function () {
    var ctx = useContext(ExpenseTrackerContext);
    var onboardingComplete = ctx.onboardingComplete;

    var tabState = useState('dashboard');
    var activeTab = tabState[0];
    var setActiveTab = tabState[1];

    // Show onboarding for first-time users
    if (!onboardingComplete) {
        return <Onboarding />;
    }

    var renderTab = function () {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'add':
                return (
                    <div className="add-page">
                        <TransactionForm />
                        <TransactionList />
                    </div>
                );
            case 'advisor':
                return <Advisor />;
            case 'goals':
                return <Goals />;
            case 'insights':
                return <Insights />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-brand">
                    <span className="dot"></span>
                    <h1 className="app-title">Personal Expense Tracker</h1>
                </div>
                <nav className="app-nav">
                    {tabs.map(function (tab) {
                        return (
                            <button
                                key={tab.id}
                                className={'nav-tab ' + (activeTab === tab.id ? 'active' : '')}
                                onClick={function () { setActiveTab(tab.id); }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </header>
            <main className="app-main">
                {renderTab()}
            </main>
            <footer className="app-footer">
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    PERSONAL EXPENSE TRACKER &middot; VOICE-FIRST FINANCE ASSISTANT
                </span>
            </footer>
        </div>
    );
};

export default App;
