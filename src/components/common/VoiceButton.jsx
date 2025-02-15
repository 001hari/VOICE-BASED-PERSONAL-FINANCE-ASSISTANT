import React from 'react';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff';
import './VoiceButton.css';

const VoiceButton = ({ isListening, isSupported, onToggle, transcript }) => {
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
                className={`voice-btn ${isListening ? 'listening' : ''}`}
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
                        <span>{transcript || 'Listening...'}</span>
                    </span>
                ) : (
                    <span className="voice-hint mono">
                        Try: "Add income 500 salary today"
                    </span>
                )}
            </div>
        </div>
    );
};

export default VoiceButton;
