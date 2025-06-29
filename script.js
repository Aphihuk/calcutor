class Calculator {
    constructor() {
        this.screen = document.querySelector('.screen');
        this.currentCalculationDisplay = document.querySelector('.current-calculation');
        this.historyList = document.querySelector('.history-list');
        this.clearHistoryBtn = document.querySelector('.clear-history');
        this.buttons = document.querySelectorAll('.btn');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.calculationHistory = [];
        this.currentCalculation = '';
        
        this.init();
    }
    
    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });
        
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        this.updateDisplay();
    }
    
    handleButtonClick(button) {
        const value = button.textContent;
        const type = this.getButtonType(button);
        
        switch (type) {
            case 'number':
                this.inputNumber(value);
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'clear':
                this.handleClear(value);
                break;
        }
        
        this.updateDisplay();
        this.updateOperatorButtons();
    }
    
    getButtonType(button) {
        if (button.classList.contains('number')) return 'number';
        if (button.classList.contains('operator')) return 'operator';
        if (button.classList.contains('clear')) return 'clear';
    }
    
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateCurrentCalculation();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
            this.currentCalculation = this.currentInput;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            // Add to history before updating display
            const calculation = `${this.formatNumber(currentValue)} ${this.operator} ${this.formatNumber(inputValue)}`;
            this.addToHistory(calculation, newValue);
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
            this.currentCalculation = this.currentInput;
        }
        
        this.waitingForOperand = true;
        
        if (nextOperator === '=') {
            this.operator = '';
            this.previousInput = '';
            this.waitingForOperand = false;
            this.currentCalculation = '';
        } else {
            this.operator = nextOperator;
            this.currentCalculation += ` ${nextOperator} `;
        }
        
        this.updateCurrentCalculation();
    }
    
    calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '−':
                return firstOperand - secondOperand;
            case '×':
                return firstOperand * secondOperand;
            case '÷':
                return secondOperand !== 0 ? firstOperand / secondOperand : 0;
            default:
                return secondOperand;
        }
    }
    
    handleClear(type) {
        switch (type) {
            case 'AC':
                this.currentInput = '0';
                this.previousInput = '';
                this.operator = '';
                this.waitingForOperand = false;
                this.currentCalculation = '';
                break;
            case '±':
                this.currentInput = String(parseFloat(this.currentInput) * -1);
                break;
            case '%':
                this.currentInput = String(parseFloat(this.currentInput) / 100);
                break;
        }
        this.updateCurrentCalculation();
    }
    
    updateDisplay() {
        const display = parseFloat(this.currentInput);
        this.screen.textContent = this.formatNumber(display);
    }
    
    updateCurrentCalculation() {
        if (this.currentCalculation === '') {
            this.currentCalculationDisplay.textContent = '';
        } else {
            let displayText = this.currentCalculation;
            if (!this.waitingForOperand && this.operator) {
                displayText += this.currentInput;
            }
            this.currentCalculationDisplay.textContent = displayText;
        }
    }
    
    addToHistory(calculation, result) {
        const historyItem = {
            calculation: calculation,
            result: this.formatNumber(result),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.calculationHistory.unshift(historyItem);
        
        // Keep only last 50 calculations
        if (this.calculationHistory.length > 50) {
            this.calculationHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        this.calculationHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <span class="history-calculation">${item.calculation}</span>
                <span class="history-result">${item.result}</span>
            `;
            this.historyList.appendChild(historyElement);
        });
    }
    
    clearHistory() {
        this.calculationHistory = [];
        this.updateHistoryDisplay();
    }
    
    formatNumber(num) {
        if (isNaN(num)) return '0';
        
        const str = num.toString();
        if (str.length > 9) {
            if (str.includes('.')) {
                return num.toFixed(9 - str.indexOf('.') - 1);
            }
            return num.toExponential(3);
        }
        return str;
    }
    
    updateOperatorButtons() {
        this.buttons.forEach(button => {
            if (button.classList.contains('operator') && !button.classList.contains('equals')) {
                if (button.textContent === this.operator && this.waitingForOperand) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    }
    
    handleKeyPress(e) {
        const key = e.key;
        const numberKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
        const operatorKeys = {'+': '+', '-': '−', '*': '×', '/': '÷', '=': '=', 'Enter': '='};
        
        if (numberKeys.includes(key)) {
            this.inputNumber(key);
        } else if (operatorKeys[key]) {
            this.inputOperator(operatorKeys[key]);
        } else if (key === 'Escape') {
            this.handleClear('AC');
        } else if (key === 'Backspace') {
            this.currentInput = this.currentInput.slice(0, -1) || '0';
            this.updateCurrentCalculation();
        }
        
        this.updateDisplay();
        this.updateOperatorButtons();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});