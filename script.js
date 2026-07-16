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
    /*const advancedButtons = [
        '√', 'ⁿ√', 'x²', '^',
        'π', 'e', 'abs', '?',
        '%', 'nCr', 'nPr', '!',
        '?', '?', '?', '?'
    ];*/
    const mainButtons = [
        '(', ')', 'C', '⌫',
        '7', '8', '9', '+',
        '4', '5', '6', '−',
        '1', '2', '3', '×',
        '0', '.', '=', '÷'
    ];

    //createButtonsInContainer('advanced-buttons', advancedButtons);
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
        const equation = mathField ? mathField.latex() : '';
        console.log(`${equation} = ` + calculateResult(equation));
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
    }

function convertToRPN(equation) {
    const tokens = latexTokens(equation);
    let outputQueue = [];
    let operatorStack = [];

    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '**': 3
    };

    for (let token of tokens) {
        if (!isNaN(token)) {
            outputQueue.push(token);
        } else if (token === '(' || token === '[' || token === '{' || token === '|') {
            operatorStack.push(token);
        }
    }
}

function latexTokens(equation) {
    let tokens = [];
    let currentToken = '';
    let index = 0;

    while (index < equation.length) {
        let char = equation[index];
        switch (true) {
            case char === '\\': // LaTeX command
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                currentToken += char;  // Add the backslash
                index++;
                while (index < equation.length && /[a-zA-Z]/.test(equation[index])) {
                    currentToken += equation[index];
                    index++;
                }
                tokens.push(currentToken);
                currentToken = '';
                continue;
            case /[+\-*/^(){}\[\]]/.test(char): // Operators and braces
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                tokens.push(char);
                break;
            case /[0-9.]/.test(char): // Numbers (including decimal points)
                while (index < equation.length && /[0-9.]/.test(equation[index])) {
                    currentToken += equation[index];
                    index++;
                }
                tokens.push(currentToken);
                currentToken = '';
                continue;
            case /\s/.test(char): // Whitespace
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                break;
            default:
                return null;
        }
        
        index++;
    }
    
    if (currentToken) tokens.push(currentToken);
    return tokens;
}
