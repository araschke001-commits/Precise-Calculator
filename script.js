let mathField;
let input;

function CreateButtons() {
    const buttonContainer = document.getElementById('buttons');

    if (!buttonContainer) return;

    const buttons = [
        '(', ')', 'C', '⌫',
        '7', '8', '9', '+',
        '4', '5', '6', '−',
        '1', '2', '3', '×',
        '0', '.', '=', '÷'
    ];

    buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'calculator-button';
        buttonElement.textContent = button;
        buttonElement.addEventListener('click', () => handleButtonClick(button));
        buttonContainer.appendChild(buttonElement);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const MQ = MathQuill.getInterface(2);
    const mathFieldSpan = document.getElementById('calculatorInput');

    input = mathFieldSpan;

    mathField = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true,
        handlers: {
            edit: function() {
                const inputValue = mathField.latex();
                detectKeywords(inputValue);
            }
        }
    });

    CreateButtons();
});

function detectKeywords(inputValue) {
    // Check for keywords in the input, like sqrt or pi, and replace them with symbols
}

function handleButtonClick(button) {
    if (button === 'C') {
        clear();
    } else if (button === '⌫') {
        deleteLastCharacter();
    } else if (button === '=') {
        calculateResult(mathField ? mathField.latex() : '');
    } else {
        appendToInput(button);
    }
}

function clear() {
    if (mathField) {
        mathField.latex('');
        mathField.focus();
    }

    const resultBox = document.getElementById('result');
    if (resultBox) {
        resultBox.textContent = '';
    }
}

function deleteLastCharacter() {
    if (!mathField) return;

    mathField.keystroke('Backspace');
    mathField.focus();
}

function calculateResult(equation) {
    // Calculate using recursion (use helper functions for individual calculations)
}

function appendToInput(button) {
    if (!mathField) return;

    const sanitizedButton = button === '×' ? '\\times' : button === '÷' ? '\\div' : button === '−' ? '-' : button;
    mathField.write(sanitizedButton);
    mathField.focus();
}