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
    'sqrt': 1,
    'root': 2, // What sqrt gets changed to by RPN converter
    'frac': 2,
    'log': 1,
    'ln': 1,
    'exp': 1,
    'sin': 1,
    'cos': 1,
    'tan': 1,
    'arcsin': 1,
    'arccos': 1,
    'arctan': 1,
    'csc': 1,
    'sec': 1,
    'cot': 1
}

function calculateResult(equation) {
    let rpnEquation = convertToRPN(equation)
    if (typeof rpnEquation === 'string') return rpnEquation;
    
    while (rpnEquation.length > 1) {
        // Find the index of the first operator or command & how many inputs it takes
        let i = 0;
        let inputs = 0;
        while (i < rpnEquation.length) {
            if (rpnEquation[i] in functionArgs) {
                inputs = functionArgs[rpnEquation[i]];
                break;
            }
            if (/[+\-*/^|]/.test(rpnEquation[i])) {
                (rpnEquation[i] === '|') ? inputs = 1 : inputs = 2;
                break;
            }
            i++;
        }

        // Calculate the first equation
        let result = '';
        const args = rpnEquation.slice(i - inputs, i);
        switch (rpnEquation[i]) {
            case '-':
                result = subtract(args[0], args[1]);
                break;
            case '+':
                result = add(args[0], args[1]);
                break;
            case '*':
                result = multiply(args[0], args[1]);
                break;
            case '/':
                result = divide(args[0], args[1]);
                break;
            case '^':
                result = 0; // Change this later when we actually have the power function
                break;
            case '|':
                result = 0; // Change this later when we actually have the abs function
                break;
            case 'sqrt':
                result = 0; // Change this later when we actually have the sqrt function
                break;
            case 'root':
                result = 0; // Change this later when we actually have nth roots
                break;
            case 'frac':
                result = divide(args[0], args[1]); // Add handling later for keeping as a fraction maybe
                break;
            default:
                console.log(`(T3) Symbol: ${rpnEquation[i]}\tIndex: ${i}`);
                return "Unrecognized Symbol";
        }

        // Replace the first equation in the equation with the result
        rpnEquation.splice(i-inputs, inputs+1); // Remove old equation
        rpnEquation.splice(i-inputs, 0, result); // Insert result
    }

    return rpnEquation[0];
}

function convertToRPN(equation) {
    const tokens = latexTokens(equation);
    if (typeof tokens === 'string') return tokens;
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
                outputQueue.push(cleanNum(token));
                break;
            case (/[+\-*/^]/.test(token)): // Operator
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] in precedence && token in precedence && precedence[operatorStack[operatorStack.length - 1]] > precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
                break;
            case (token in functionArgs): // Function
                if (token === 'sqrt' && tokens[1] === '['){
                    token = 'root';
                }
                operatorStack.push(token);
                functionArgNum = functionArgs[token];
                break;
            case (token === 'left'):
                // Ensure | is detected correctly as left or right
                isLeftBrace = true;
                tokens.shift();
                continue;
            case (token === '(' || token === '[' || token === '{' || (token === '|' && isLeftBrace == true)):
                // If left brace, push to stack
                operatorStack.push(token);
                break;
            case (token === 'right'):
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(' && operatorStack[operatorStack.length - 1] !== '[' && operatorStack[operatorStack.length - 1] !== '{' && operatorStack[operatorStack.length - 1] !== '|') {
                    outputQueue.push(operatorStack.pop()); // Pop all up until the left brace to the output queue
                }
                const leftBrace = operatorStack.pop(); // Remove the left brace
                if (leftBrace === '|') outputQueue.push(leftBrace); // Add brace to signify absolute value
                tokens.shift(); // Remove the \right so the closing brace gets removed at the end of the loop
                break;
            case (token === ')' || token === ']' || token === '}'): // Function closing brace
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
                console.log(`(T2) Symbol: ${token}`);
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
    let lastIsNum = false;

    while (index < equation.length) {
        let char = equation[index];
        switch (true) {
            case char === '\\': // LaTeX command
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                index++;
                // Adds the command name without the backslash
                while (index < equation.length && /[a-zA-Z]/.test(equation[index])) {
                    currentToken += equation[index];
                    index++;
                }

                //Handle operators like \times and \div
                switch (currentToken) {
                    case 'times':
                        currentToken = '*';
                        break;
                    case 'cdot':
                        currentToken = '*';
                        break;
                    case 'div':
                        currentToken = '/';
                        break;
                }

                tokens.push(currentToken);
                currentToken = '';
                lastIsNum = false;
                continue; // Skips the index++ at the end of the switch block because we already incremented it above
            case /[(){}\[\]|]/.test(char): // Braces
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                tokens.push(char);
                lastIsNum = false;
                break;
            case /[+\-*/^]/.test(char): // Operators
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                if (lastIsNum) {
                    tokens.push(char);
                    lastIsNum = false;
                    break;
                }
                lastIsNum = false;
            case /[-0-9.+]/.test(char): // Numbers (including decimal points and signs)
                let digitDetected = false;

                // Tests for numbers, only including signs if a number has not been detected yet
                while (index < equation.length && ((/[-0-9.+]/.test(equation[index]) && !digitDetected) || (digitDetected && /[0-9.]/.test(equation[index])))) {
                    digitDetected = /[0-9.]/.test(equation[index]);
                    currentToken += equation[index];
                    index++;
                }
                lastIsNum = true;
                tokens.push(currentToken);
                currentToken = '';
                continue; // Skips the index++ at the end of the switch block because we already incremented it above
            case /\s/.test(char): // Whitespace
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                break;
            default:
                console.log(`(T1) Symbol: ${char}\tIndex: ${index}`);
                return "Unrecognized Symbol";
        }
        
        index++;
    }
    
    if (currentToken) tokens.push(currentToken);
    return tokens;
}

// Modulus function that works with negative numbers (Ex: mod(-1, 5) = 4)
const mod = (n, m) => ((n % m) + m) % m;

//For calculations, numbers must be cleaned (using cleanNum) and numbers must be strings

function subtract(num1, num2) {
    return null; // Placeholder until the function is at testing state
    let isNegative = false;

    // Handle negative numbers
    if (num1[0] === '-' && num2[0] === '-') { // Both negative
        return subtract(num2.slice(1), num1.slice(1)); // Swap numbers and remove - (answer still positive)
    } else if (num1[0] === '-' && num2[0] !== '-') { // Only num1 negative
        return '-' + add(num1.slice(1), num2); // Add abs of nums and - it
    } else if (num1[0] !== '-' && num2[0] === '-') { // Only num2 negative
        return add(num1, num2.slice(1)); // Add abs of num2
    }
    
    // Determine which number is greater
    if (num2.length > num1.length) {
        // Swap the numbers (answer will be negative)
        let temp = num1;
        num1 = num2;
        num2 = temp;
        isNegative = true;
    } else if (num2.length === num1.length) {
        // Check digit by digit for which is greater
        for (let i = 0; i < num1.length, i++;) {
            let num1digit = Number(num1[i]);
            let num2digit = Number(num2[i]);

            // Handle decimal points
            if (isNaN(num1digit) && isNaN(num2digit)) {
                continue;
            } else if (isNaN(num1digit)) {
                // If num1digit is NaN, it must be a decimal point, so num2 is greater

                // Swap the numbers (answer will be negative)
                let temp = num1;
                num1 = num2;
                num2 = temp;
                isNegative = true;
                break;
            } else if (isNaN(num2digit)) {
                // If num2digit is NaN, it must be a decimal point, so num1 is greater
                break;
            }
            
            if (num1digit > num2digit) {
                break;
            } else if (num2digit > num1digit) {
                // Swap the numbers (answer will be negative)
                let temp = num1;
                num1 = num2;
                num2 = temp;
                isNegative = true;
                break;
            }
        }
    }

    //Conditions at this point: num2.length < num1.length, nums are clean, nums are positive

    // Align decimal points if either number is a decimal & delete the decimal points
    let num1DecimalDis = (num1.length - 1) - num1.indexOf('.');
    let num2DecimalDis = (num2.length - 1) - num2.indexOf('.');
    let decimalPos = Math.min(mod(num1.indexOf('.'), num1.length + 1), mod(num2.indexOf('.'), num2.length + 1)); // If there is no decimal, the index will be -1, so we use mod to make it the length of the number
    if (!(num1DecimalDis >= num1.length && num2DecimalDis >= num2.length)) { // If there are any decimals
        if (num1DecimalDis > num2DecimalDis) {
            for (let i = 0; i < num1DecimalDis - num2DecimalDis; i++) {
                num2 = num2 + '0';
            }
        } else if (num2DecimalDis > num1DecimalDis) {
            for (let i = 0; i < num2DecimalDis - num1DecimalDis; i++) {
                num1 = num1 + '0';
            }
        }

        // Delete the decimal points
        num1 = num1.replace('.', '');
        num2 = num2.replace('.', '');
    }

    // Add extra zeros if needed at the start of num2
    for (let i = 0; i < num2.length - num1.length; i++) {
        num2 = "0" + num2;
    }
    
    console.log(`Subtraction set up. Nums: ${num1}, ${num2}`);

    // Perform subtraction

}

function add(num1, num2) {
    return null; // Placeholder until the function is at testing state
}

function multiply(num1, num2) {
    return null; // Placeholder until the function is at testing state
}

function divide(num1, num2) {
    return null; // Placeholder until the function is at testing state
}

// Removes any extra zeros at the beginning and end (if decimal) (Ex: 099.90 -> 99.9) and any extra signs (Ex: -+-2 -> 2)
function cleanNum(num) {
    console.log(`Cleaning ${num}...`)
    let i = 0;
    let isNegative = false;
    let charCount = 0
    let cleanedNum = num;
    
    // Remove extra signs and extra decimal points
    while (i < cleanedNum.length && !/[0-9.]/.test(cleanedNum[i])) {
        charCount++;
        if (cleanedNum[i] === '-') {
            isNegative = !isNegative;
        }
        i++;
    }
    cleanedNum = cleanedNum.slice(charCount);
    if (isNegative) cleanedNum = "-" + cleanedNum;
    // Remove extra decimal points
    if (cleanedNum.indexOf('.') !== cleanedNum.lastIndexOf('.')) {
        let decimalNum = cleanedNum.split('.').length - 1;
        if (cleanedNum.lastIndexOf('.') - cleanedNum.indexOf('.') + 1 !== decimalNum) {
            return "Syntax Error (Invalid number format)";
        }
        let decimalIndex = cleanedNum.indexOf('.');
        cleanedNum = cleanedNum.slice(0, decimalIndex) + cleanedNum.slice(decimalIndex + decimalNum);
    }
    console.log(`Cleaning - Stage 1 complete (${cleanedNum})`)

    // Remove zeros from beginning
    i = 0;
    charCount = 0;
    let skipCount = 0;
    while (i < cleanedNum.length && !/[1-9.]/.test(cleanedNum[i])) {
        if (cleanedNum[i] === '0') {
            charCount++;
        } else { // Negatives
            skipCount++;
        }
        i++;
    }
    cleanedNum = cleanedNum.slice(0, skipCount) + cleanedNum.slice(skipCount + charCount);
    if (cleanedNum[0] === '.') cleanedNum = '0' + cleanedNum;
    console.log(`Cleaning - Stage 2 complete (${cleanedNum})`)

    // If decimal, remove zeros from end
    if (cleanedNum.includes(".")) {
        i = cleanedNum.length-1;
        charCount = 0;
        while (i >= 0 && !/[1-9]/.test(cleanedNum[i])) {
            charCount++;
            i--;
        }
        if (charCount > 0) { // If there aren't any to remove, it would retrieve 0 to 0, so deletes the number
            cleanedNum = cleanedNum.slice(0, -charCount);
        }
        console.log(`Cleaning - Stage 3 complete (${cleanedNum})`)
    }

    console.log(`Cleaned: ${cleanedNum}`);
    return (cleanedNum === "") ? "0" : cleanedNum;
}