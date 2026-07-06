const buttonContainer = document.querySelector('.buttons');
const buttons = [
    'AC', '(', ')', '+',
    '7', '8', '9', '-',
    '4', '5', '6', '*',
    '1', '2', '3', '/',
    '0', '.', '<=', '='
];

const input = document.querySelector('.calculator-input');

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
        clearInput();
    } else if (button === '<=') {
        deleteLastCharacter();
    } else if (button === '=') {
        calculateResult(input.textContent);
    } else {
        appendToInput(button);
    }   
}

function clearInput() {
    input.textContent = '';
}

function deleteLastCharacter() {
    input.textContent = input.textContent.slice(0, -1);
}

function calculateResult(equation) {
    // Calculate using recursion (use helper functions for individual calculations)
}

function appendToInput(button) {
    input.textContent += button;
}