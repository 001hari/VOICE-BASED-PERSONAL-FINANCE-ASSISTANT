import React, { useState, useEffect, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ExpenseTrackerContext } from '../../context/context';
import { incomeCategories, expenseCategories } from '../../constants/categories';
import formatDate from '../../utils/formatDate';
import parseVoiceCommand from '../../utils/parseVoiceCommand';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import VoiceButton from '../common/VoiceButton';
import Snackbar from '../common/Snackbar';
import './TransactionForm.css';

var initialState = {
    amount: '',
    category: '',
    type: 'Income',
    date: formatDate(new Date()),
};

var TransactionForm = function () {
    var formState = useState(initialState);
    var formData = formState[0];
    var setFormData = formState[1];

    var snackState = useState(false);
    var openSnack = snackState[0];
    var setOpenSnack = snackState[1];

    var context = useContext(ExpenseTrackerContext);
    var addTransaction = context.addTransaction;

    var voice = useVoiceRecognition();

    var selectedCategories = formData.type === 'Income' ? incomeCategories : expenseCategories;

    var createTransaction = useCallback(function () {
        if (!formData.amount || Number.isNaN(Number(formData.amount))) return;
        if (!formData.category) return;
        if (!formData.date || !formData.date.includes('-')) return;

        var transaction = {
            amount: Number(formData.amount),
            category: formData.category,
            type: formData.type,
            date: formData.date,
            id: uuidv4(),
        };

        addTransaction(transaction);
        setOpenSnack(true);
        setFormData(initialState);
    }, [formData, addTransaction, setFormData, setOpenSnack]);

    // Process voice transcript
    useEffect(function () {
        if (voice.transcript && !voice.isListening) {
            var parsed = parseVoiceCommand(voice.transcript);
            if (parsed) {
                setFormData(function (prev) {
                    return {
                        ...prev,
                        ...(parsed.type ? { type: parsed.type } : {}),
                        ...(parsed.amount ? { amount: parsed.amount } : {}),
                        ...(parsed.category ? { category: parsed.category } : {}),
                        ...(parsed.date ? { date: parsed.date } : {}),
                    };
                });
            }
        }
    }, [voice.transcript, voice.isListening, setFormData]);

    var handleCloseSnack = useCallback(function () {
        setOpenSnack(false);
    }, [setOpenSnack]);

    return (
        <div className="transaction-form">
            <Snackbar
                open={openSnack}
                message="Transaction added successfully!"
                type="success"
                onClose={handleCloseSnack}
            />

            {/* Voice Input */}
            <div className="card voice-card">
                <span className="label">Voice Input</span>
                <VoiceButton
                    isListening={voice.isListening}
                    isSupported={voice.isSupported}
                    onToggle={voice.toggleListening}
                    transcript={voice.transcript}
                />
            </div>

            {/* Form */}
            <div className="card form-card">
                <span className="label">Add Transaction</span>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={function (e) { setFormData({ ...formData, type: e.target.value, category: '' }); }}
                        >
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={function (e) { setFormData({ ...formData, category: e.target.value }); }}
                        >
                            <option value="">Select category</option>
                            {selectedCategories.map(function (c) {
                                return <option key={c.type} value={c.type}>{c.type}</option>;
                            })}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount ({'\u20B9'})</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={formData.amount}
                            onChange={function (e) { setFormData({ ...formData, amount: e.target.value }); }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.date}
                            onChange={function (e) { setFormData({ ...formData, date: formatDate(e.target.value) }); }}
                        />
                    </div>
                </div>

                <button className="btn btn-primary form-submit" onClick={createTransaction}>
                    <span className="dot" style={{ background: 'var(--white)' }}></span>
                    Create Transaction
                </button>
            </div>
        </div>
    );
};

export default TransactionForm;
