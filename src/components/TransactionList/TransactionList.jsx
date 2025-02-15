import React, { useContext } from 'react';
import Delete from '@material-ui/icons/Delete';
import { ExpenseTrackerContext } from '../../context/context';
import './TransactionList.css';

var TransactionList = function () {
    var context = useContext(ExpenseTrackerContext);
    var transactions = context.transactions;
    var deleteTransaction = context.deleteTransaction;

    if (transactions.length === 0) {
        return (
            <div className="card">
                <span className="label">Recent Transactions</span>
                <p className="no-data">No transactions yet. Add one above!</p>
            </div>
        );
    }

    return (
        <div className="card transaction-list">
            <span className="label">Recent Transactions</span>
            <div className="txn-items">
                {transactions.map(function (t) {
                    var isIncome = t.type === 'Income';
                    return (
                        <div key={t.id} className="txn-item fade-in">
                            <div className="txn-indicator" style={{
                                background: isIncome ? 'var(--income)' : 'var(--expense)',
                            }}></div>
                            <div className="txn-info">
                                <span className="txn-category">{t.category}</span>
                                <span className="txn-meta">{t.type} &middot; {t.date}</span>
                            </div>
                            <span className={'txn-amount mono ' + (isIncome ? 'amount-income' : 'amount-expense')}>
                                {isIncome ? '+' : '-'}{'\u20B9'}{t.amount.toLocaleString('en-IN')}
                            </span>
                            <button
                                className="btn-icon txn-delete"
                                onClick={function () { deleteTransaction(t.id); }}
                                title="Delete transaction"
                            >
                                <Delete style={{ fontSize: 18 }} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionList;
