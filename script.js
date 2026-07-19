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
        const result = calculateResult(equation);
        console.log(`${equation} = ` + result);
        const resultBox = document.getElementById('result');
        if (resultBox) {
            resultBox.textContent = result;
        }
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

    let sanitizedButton;
    switch (button){
        case '×':
            sanitizedButton = '\\times';
            break;
        case '÷':
            sanitizedButton = '\\div'
            break;
        case '−':
            sanitizedButton = '-';
            break;
        default:
            sanitizedButton = button;
            break;
    }
    mathField.write(sanitizedButton);
    mathField.focus();
}

const functionArgs = {
    '\\sqrt': 1,
    '\\root': 2, // What sqrt gets changed to by RPN converter
    '\\frac': 2,
    '\\log': 1,
    '\\ln': 1,
    '\\exp': 1,
    '\\sin': 1,
    '\\cos': 1,
    '\\tan': 1,
    '\\arcsin': 1,
    '\\arccos': 1,
    '\\arctan': 1,
    '\\csc': 1,
    '\\sec': 1,
    '\\cot': 1
}

function calculateResult(equation) {
    let rpnEquation = convertToRPN(equation)
    if (rpnEquation == null) return "Unrecognized Symbol";
    return rpnEquation;
}

function convertToRPN(equation) {
    const tokens = latexTokens(equation);
    if (typeof tokens == 'string') return tokens;
    let outputQueue = [];
    let operatorStack = [];

    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3
    };

    let isLeftBrace = false;
    let functionArgNum = 0;

    while (tokens.length > 0) {
        let token = tokens[0];
        switch (true) {
            case (/[0-9.]+/.test(token)): // Number
                outputQueue.push(token);
                break;
            case (/[+\-*/^]/.test(token)): // Operator
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] in precedence && token in precedence && precedence[operatorStack[operatorStack.length - 1]] > precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
                break;
            case (token in functionArgs): // Function
                if (token === '\\sqrt' && tokens[1] === '['){
                    token = '\\root';
                }
                operatorStack.push(token);
                functionArgNum = functionArgs[token];
                break;
            case (token === '\\left'):
                // Ensure | is detected correctly as left or right
                isLeftBrace = true;
                tokens.shift();
                continue;
            case (token === '(' || token === '[' || token === '{' || (token === '|' && isLeftBrace == true)):
                // If left brace, push to stack
                operatorStack.push(token);
                break;
            case (token === '\\right'):
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(' && operatorStack[operatorStack.length - 1] !== '[' && operatorStack[operatorStack.length - 1] !== '{' && operatorStack[operatorStack.length - 1] !== '|') {
                    outputQueue.push(operatorStack.pop()); // Pop all up until the left brace to the output queue
                }
                operatorStack.pop(); // Remove the left brace
                tokens.shift(); // Remove the \right so the closing brace gets removed at the end of the loop
                break;
            case (token === ')' || token === ']' || token === '}' || (token === '|' && isLeftBrace == false)): // Function closing brace
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(' && operatorStack[operatorStack.length - 1] !== '[' && operatorStack[operatorStack.length - 1] !== '{' && operatorStack[operatorStack.length - 1] !== '|') {
                    outputQueue.push(operatorStack.pop()); // Pop all up until the left brace to the output queue
                }
                operatorStack.pop(); // Remove the left brace
                if (operatorStack[operatorStack.length - 1] in functionArgs && functionArgNum == 1) {
                    outputQueue.push(operatorStack.pop()); // Pop the function name to the output queue
                }
                if (functionArgNum > 0) {
                    functionArgNum -= 1;
                }
                break;
            default:
                return "Unrecognized Symbol";
        }
        tokens.shift(); // Delete the first element in tokens
        isLeftBrace = false;
    }
    while (operatorStack.length > 0){
        outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
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

                //Handle operators like \times and \div
                switch (currentToken) {
                    case '\\times':
                        currentToken = '*';
                        break;
                    case '\\cdot':
                        currentToken = '*';
                        break;
                    case '\\div':
                        currentToken = '/';
                        break;
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
                return "Unrecognized Symbol";
        }
        
        index++;
    }
    
    if (currentToken) tokens.push(currentToken);
    return tokens;
}
