import React, { useState, useEffect } from 'react';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff';
import './VoiceButton.css';

var examples = [
    '"Add expense 500 food today"',
    '"Income 45000 salary"',
    '"Spent 200 on travel yesterday"',
    '"Expense 1000 shopping Monday"',
    '"Expense 300 bills"',
    '"Add income 5000 extra income"',
    '"Spent 250 on entertainment"',
];

var VoiceButton = function (props) {
    var isListening = props.isListening;
    var isSupported = props.isSupported;
    var onToggle = props.onToggle;
    var transcript = props.transcript;

    var exampleState = useState(0);
    var exampleIdx = exampleState[0];
    var setExampleIdx = exampleState[1];

    // Rotate examples every 3 seconds
    useEffect(function () {
        var timer = setInterval(function () {
            setExampleIdx(function (prev) { return (prev + 1) % examples.length; });
        }, 3000);
        return function () { clearInterval(timer); };
    }, [setExampleIdx]);

    if (!isSupported) {
        return (
            <div className="voice-unsupported">
                <p className="mono">Voice input not available. Use Chrome or Edge.</p>
            </div>
        );
    }

    return (
        <div className="voice-container">
            <button
                className={'voice-btn ' + (isListening ? 'listening' : '')}
                onClick={onToggle}
                title={isListening ? 'Stop listening' : 'Start voice input'}
            >
                <span className="voice-btn-inner">
                    {isListening ? <MicOff style={{ fontSize: 24 }} /> : <Mic style={{ fontSize: 24 }} />}
                </span>
            </button>

            <div className="voice-status">
                {isListening ? (
                    <span className="voice-listening">
                        <span className="dot"></span>
                        <span>{transcript || 'Listening... speak now'}</span>
                    </span>
                ) : (
                    <div className="voice-examples">
                        <span className="voice-tap-hint">Tap the mic and try saying:</span>
                        <span className="voice-example-text fade-in" key={exampleIdx}>
                            {examples[exampleIdx]}
                        </span>
                    </div>
                )}
            </div>

            {/* All examples listed */}
            {!isListening && (
                <div className="voice-all-examples">
                    <span className="label" style={{ marginBottom: 8, fontSize: 9 }}>Example Commands</span>
                    <div className="examples-list">
                        {examples.slice(0, 4).map(function (ex, i) {
                            return (
                                <span key={i} className="example-chip mono">{ex}</span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceButton;
