const buttonContainer = document.getElementById('buttons');
const buttons = [
    'AC', '(', ')', '+',
    '7', '8', '9', '-',
    '4', '5', '6', '*',
    '1', '2', '3', '/',
    '0', '.', '<=', '='
];

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

function handleButtonClick(button) {
    if (button === 'AC') {
        clearAll();
    } else if (button === '<=') {
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