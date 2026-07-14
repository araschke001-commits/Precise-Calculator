let mathField;
let input;

function createButtonsInContainer(containerId, buttons) {
    const buttonContainer = document.getElementById(containerId);

    if (!buttonContainer) return;

    buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.type = 'button';
        buttonElement.className = 'calculator-button';
        buttonElement.textContent = button;
        buttonElement.addEventListener('click', () => handleButtonClick(button));
        buttonContainer.appendChild(buttonElement);
    });
}

function CreateButtons() {
    const advancedButtons = [
        '√', 'ⁿ√', 'x²', '^',
        'π', 'e', 'abs', '?',
        '%', 'nCr', 'nPr', '!',
        '?', '?', '?', '?'
    ];
    const mainButtons = [
        '(', ')', 'C', '⌫',
        '7', '8', '9', '+',
        '4', '5', '6', '−',
        '1', '2', '3', '×',
        '0', '.', '=', '÷'
    ];

    createButtonsInContainer('advanced-buttons', advancedButtons);
    createButtonsInContainer('main-buttons', mainButtons);
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
        calculateResult(mathField ? mathField.latex().replace(/\s+/g, '') : '');
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

function appendToInput(button) {
    if (!mathField) return;

    const sanitizedButton = button === '×' ? '\\times' : button === '÷' ? '\\div' : button === '−' ? '-' : button;
    mathField.write(sanitizedButton);
    mathField.focus();
}

function calculateResult(equation) {
    return null; // Placeholder so the function doesn't run forever
    if (equation === "" || equation === null || !isNaN(Number(equation))) {
        return equation; // Return the original equation if it's empty, null, or a single number
    }

    let newEquation = equation;

    // Calculate using recursion (use helper functions for individual calculations)
    let simpleEquation = findFirstEquation(newEquation);

    return calculateResult(newEquation); // Return the result
}

function findFirstEquation(equation) {
    // Implement the logic to find the first equation needing to be done from the equation (using order of operations)
    // This function should return the first equation of two numbers (Ex: 4+7) and the start index of that equation in the original equation string. If no equation is found, return null.
    const operationOrder = [['\\sqrt', '\\nthroot', '^'], ['\\times', '\\div', '\\frac'], ['+', '-', '\\pm']];
}