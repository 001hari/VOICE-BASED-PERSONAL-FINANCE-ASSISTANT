import React, { useEffect } from 'react';
import './Snackbar.css';

const Snackbar = ({ open, message, type, onClose }) => {
    var snackType = type || 'success';

    useEffect(() => {
        if (open) {
            var timer = setTimeout(function() { onClose(); }, 3000);
            return function() { clearTimeout(timer); };
        }
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={'toast toast-' + snackType + ' slide-up'}>
            <span className="dot-sm" style={{
                background: snackType === 'success' ? 'var(--income)' : 'var(--expense)'
            }}></span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>&times;</button>
        </div>
    );
};

export default Snackbar;
