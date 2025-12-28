import React, { useState } from 'react';
import './VirtualKeyboard.css';

const VirtualKeyboard = ({ onKeyPress, onClose }) => {
    const [isUpperCase, setIsUpperCase] = useState(false);

    // ALWAYS keep letters in lowercase here
    const keys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ];

    const handleKeyClick = (key) => {
        // If letter → apply case
        if (/^[a-z]$/.test(key)) {
            onKeyPress(isUpperCase ? key.toUpperCase() : key);
        } else {
            onKeyPress(key);
        }
    };

    const handleBackspace = () => onKeyPress('Backspace');
    const handleSpace = () => onKeyPress(' ');
    const handleClear = () => onKeyPress('Clear');

    const toggleCase = () => {
        setIsUpperCase((prev) => !prev);
    };

    return (
        <div className="virtual-keyboard-overlay" onClick={onClose}>
            <div
                className="virtual-keyboard"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="keyboard-header">
                    <h3>Keyboard</h3>
                    <button className="close-keyboard-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="keyboard-keys">
                    {keys.map((row, rowIndex) => (
                        <div key={rowIndex} className="keyboard-row">
                            {row.map((key) => (
                                <button
                                    key={key}
                                    className="keyboard-key"
                                    onClick={() => handleKeyClick(key)}
                                >
                                    {/^[a-z]$/.test(key)
                                        ? isUpperCase
                                            ? key.toUpperCase()
                                            : key
                                        : key}
                                </button>
                            ))}
                        </div>
                    ))}

                    <div className="keyboard-row keyboard-bottom-row">
                        <button
                            className={`keyboard-key keyboard-shift ${isUpperCase ? 'active' : ''
                                }`}
                            onClick={toggleCase}
                        >
                            {isUpperCase ? 'ABC' : 'abc'}
                        </button>

                        <button
                            className="keyboard-key keyboard-clear"
                            onClick={handleClear}
                        >
                            Clear
                        </button>

                        <button
                            className="keyboard-key keyboard-space"
                            onClick={handleSpace}
                        >
                            Space
                        </button>

                        <button
                            className="keyboard-key keyboard-backspace"
                            onClick={handleBackspace}
                        >
                            ⌫
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualKeyboard;
