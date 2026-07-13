let mathField; // Declare mathField in the global scope

document.addEventListener('DOMContentLoaded', function() {
    // Get interface & element for MathQuill
    let MQ = MathQuill.getInterface(2);
    let mathFieldSpan = MQ.MathField(document.getElementById('calculatorInput'));
    
    // Initialize MathField
    mathField = MQ.MathField(mathFieldSpan, {
        handlers: {
            edit: function() {
                // Read input automatically on every change
                let inputValue = mathField.latex();

                detectKeywords(inputValue);
            }
        }
    });
});

const buttonContainer = document.getElementById('buttons');
const buttons = [
    'AC', '(', ')', '+',
    '7', '8', '9', '\u2212',
    '4', '5', '6', '\u00D7',
    '1', '2', '3', '\u00F7',
    '0', '.', '\u2408', '='
];
/*
Sqrt: u221A
x root: u221B
Pi: u03C0
Power of 2: u00B2
Power of x: u02E3
*/
const input = document.getElementById('calculatorInput');

function CreateButtons() {
    buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'calculator-button';
        buttonElement.textContent = button;
        buttonElement.addEventListener('click', () => handleButtonClick(button));
        buttonContainer.appendChild(buttonElement);
    });
}

function detectKeywords(inputValue) {
    // Check for keywords in the input, like sqrt or pi, and replace them with symbols
}

function handleButtonClick(button) {
    if (button === 'AC') {
        clearAll();
    } else if (button === '\u2408') {
        deleteLastCharacter();
    } else if (button === '=') {
        calculateResult(input.value);
    } else {
        appendToInput(button);
    }
}

function clearAll() {
    input.value = '';
    document.getElementById('result').textContent = '';
    // Clear history
}

function deleteLastCharacter() {
    input.value = input.value.slice(0, -1);
}

function calculateResult(equation) {
    // Calculate using recursion (use helper functions for individual calculations)
}

function appendToInput(button) {
    input.value += button;
}

CreateButtons();