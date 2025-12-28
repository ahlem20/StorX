import React from "react";
import "./NumericKeypad.css";
import { FiDelete } from "react-icons/fi";

const NumericKeypad = ({ onKeyPress }) => {
    const keys = [
        "1", "2", "3",
        "4", "5", "6",
        "7", "8", "9",
        "C", "0", "⌫"
    ];

    return (
        <div className="numeric-keypad">
            {keys.map((key) => (
                <button
                    key={key}
                    className={`keypad-btn ${key === "C" ? "clear-btn" : ""} ${key === "⌫" ? "backspace-btn" : ""}`}
                    onClick={() => onKeyPress(key)}
                    type="button" // Prevent form submission if inside a form
                >
                    {key === "⌫" ? <FiDelete /> : key}
                </button>
            ))}
        </div>
    );
};

export default NumericKeypad;
