/**
 * Excel Mastery - Formula Builder
 * 
 * This module creates an interactive formula builder to help users
 * understand Excel formula syntax and construction. It provides a visual
 * editor for formulas with syntax highlighting and component selection.
 */

class FormulaBuilder {
    constructor() {
        // Create modal container if it doesn't exist
        this.createModalContainer();
        
        // Reference to the formula being built
        this.currentFormula = '';
        
        // Formula components by category
        this.formulaComponents = {
            math: [
                { name: 'SUM', description: 'Adds values', syntax: 'SUM(number1, [number2], ...)' },
                { name: 'AVERAGE', description: 'Calculates average', syntax: 'AVERAGE(number1, [number2], ...)' },
                { name: 'COUNT', description: 'Counts numeric values', syntax: 'COUNT(value1, [value2], ...)' },
                { name: 'MAX', description: 'Returns maximum value', syntax: 'MAX(number1, [number2], ...)' },
                { name: 'MIN', description: 'Returns minimum value', syntax: 'MIN(number1, [number2], ...)' },
                { name: 'PRODUCT', description: 'Multiplies values', syntax: 'PRODUCT(number1, [number2], ...)' }
            ],
            logical: [
                { name: 'IF', description: 'Conditional logic', syntax: 'IF(logical_test, value_if_true, value_if_false)' },
                { name: 'AND', description: 'Tests multiple conditions', syntax: 'AND(logical1, [logical2], ...)' },
                { name: 'OR', description: 'Tests if any condition is true', syntax: 'OR(logical1, [logical2], ...)' },
                { name: 'NOT', description: 'Negates a condition', syntax: 'NOT(logical)' },
                { name: 'IFERROR', description: 'Handles errors', syntax: 'IFERROR(value, value_if_error)' }
            ],
            text: [
                { name: 'CONCATENATE', description: 'Joins text', syntax: 'CONCATENATE(text1, [text2], ...)' },
                { name: 'LEFT', description: 'Extracts left characters', syntax: 'LEFT(text, num_chars)' },
                { name: 'RIGHT', description: 'Extracts right characters', syntax: 'RIGHT(text, num_chars)' },
                { name: 'MID', description: 'Extracts middle characters', syntax: 'MID(text, start_num, num_chars)' },
                { name: 'LEN', description: 'Returns text length', syntax: 'LEN(text)' }
            ],
            lookup: [
                { name: 'VLOOKUP', description: 'Vertical lookup', syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])' },
                { name: 'HLOOKUP', description: 'Horizontal lookup', syntax: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])' },
                { name: 'INDEX', description: 'Returns value at position', syntax: 'INDEX(array, row_num, [column_num])' },
                { name: 'MATCH', description: 'Finds position in range', syntax: 'MATCH(lookup_value, lookup_array, [match_type])' }
            ],
            date: [
                { name: 'TODAY', description: 'Current date', syntax: 'TODAY()' },
                { name: 'NOW', description: 'Current date and time', syntax: 'NOW()' },
                { name: 'YEAR', description: 'Extracts year', syntax: 'YEAR(serial_number)' },
                { name: 'MONTH', description: 'Extracts month', syntax: 'MONTH(serial_number)' },
                { name: 'DAY', description: 'Extracts day', syntax: 'DAY(serial_number)' }
            ],
            operators: [
                { name: '+', description: 'Addition', syntax: 'value1 + value2' },
                { name: '-', description: 'Subtraction', syntax: 'value1 - value2' },
                { name: '*', description: 'Multiplication', syntax: 'value1 * value2' },
                { name: '/', description: 'Division', syntax: 'value1 / value2' },
                { name: '^', description: 'Exponentiation', syntax: 'value1 ^ value2' },
                { name: '&', description: 'Text concatenation', syntax: 'text1 & text2' }
            ]
        };
    }
    
    // Create the modal container for the formula builder
    createModalContainer() {
        if (document.getElementById('formula-builder-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'formula-builder-modal';
        modal.className = 'formula-builder-modal';
        
        modal.innerHTML = `
            <div class="formula-builder-content">
                <div class="formula-builder-header">
                    <h3>Excel Formula Builder</h3>
                    <button class="formula-builder-close" aria-label="Close">&times;</button>
                </div>
                <div class="formula-workspace">
                    <h4>Formula Preview</h4>
                    <div class="formula-preview" id="formula-preview"></div>
                    
                    <h4>Formula Editor</h4>
                    <textarea class="formula-editor" id="formula-editor" placeholder="Start typing or use the components below..."></textarea>
                    
                    <div class="formula-components">
                        <div class="component-group">
                            <h4>Math Functions</h4>
                            <div class="component-buttons" id="math-functions"></div>
                        </div>
                        <div class="component-group">
                            <h4>Logical Functions</h4>
                            <div class="component-buttons" id="logical-functions"></div>
                        </div>
                    </div>
                    
                    <div class="formula-components">
                        <div class="component-group">
                            <h4>Text Functions</h4>
                            <div class="component-buttons" id="text-functions"></div>
                        </div>
                        <div class="component-group">
                            <h4>Operators</h4>
                            <div class="component-buttons" id="operators"></div>
                        </div>
                    </div>
                    
                    <div class="formula-help">
                        <h4>Function Syntax Guide</h4>
                        <p id="function-syntax">Select a function to see its syntax</p>
                    </div>
                </div>
                <div class="formula-builder-footer">
                    <button class="secondary-btn" id="reset-formula">Reset</button>
                    <button class="primary-btn" id="apply-formula">Apply Formula</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = document.querySelector('.formula-builder-close');
        closeButton.addEventListener('click', () => this.closeBuilder());
        
        const formulaEditor = document.getElementById('formula-editor');
        formulaEditor.addEventListener('input', () => this.updateFormulaPreview());
        
        const resetButton = document.getElementById('reset-formula');
        resetButton.addEventListener('click', () => this.resetFormula());
        
        const applyButton = document.getElementById('apply-formula');
        applyButton.addEventListener('click', () => this.applyFormula());
        
        // Populate function buttons
        this.populateFunctionButtons();
    }
    
    // Populate function buttons from the components list
    populateFunctionButtons() {
        // Populate math functions
        const mathFunctionsContainer = document.getElementById('math-functions');
        this.populateFunctionGroup(mathFunctionsContainer, this.formulaComponents.math);
        
        // Populate logical functions
        const logicalFunctionsContainer = document.getElementById('logical-functions');
        this.populateFunctionGroup(logicalFunctionsContainer, this.formulaComponents.logical);
        
        // Populate text functions
        const textFunctionsContainer = document.getElementById('text-functions');
        this.populateFunctionGroup(textFunctionsContainer, this.formulaComponents.text);
        
        // Populate operators
        const operatorsContainer = document.getElementById('operators');
        this.populateFunctionGroup(operatorsContainer, this.formulaComponents.operators);
    }
    
    // Populate a function group with buttons
    populateFunctionGroup(container, functions) {
        container.innerHTML = '';
        
        functions.forEach(func => {
            const button = document.createElement('button');
            button.className = 'component-btn';
            button.textContent = func.name;
            button.setAttribute('title', func.description);
            
            button.addEventListener('click', () => {
                this.insertFunction(func);
            });
            
            // Also update syntax guide on hover
            button.addEventListener('mouseenter', () => {
                document.getElementById('function-syntax').textContent = func.syntax;
            });
            
            container.appendChild(button);
        });
    }
    
    // Open the formula builder with an optional starting formula
    openBuilder(formula = '') {
        const modal = document.getElementById('formula-builder-modal');
        modal.style.display = 'block';
        
        // Set the formula if provided
        if (formula) {
            this.currentFormula = formula;
            document.getElementById('formula-editor').value = formula;
            this.updateFormulaPreview();
        } else {
            this.resetFormula();
        }
        
        // Add keyboard shortcut for closing (Escape key)
        document.addEventListener('keydown', this.handleEscapeKey);
        
        // Focus the editor
        setTimeout(() => {
            document.getElementById('formula-editor').focus();
        }, 100);
        
        // Add animation
        const content = document.querySelector('.formula-builder-content');
        content.classList.add('animate-modal');
    }
    
    // Handle Escape key to close modal
    handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            this.closeBuilder();
        }
    };
    
    // Close the formula builder
    closeBuilder() {
        const modal = document.getElementById('formula-builder-modal');
        modal.style.display = 'none';
        
        // Remove keyboard shortcut listener
        document.removeEventListener('keydown', this.handleEscapeKey);
        
        // Dispatch event indicating builder was closed
        document.dispatchEvent(new CustomEvent('formulaBuilderClosed', {
            detail: { formula: this.currentFormula }
        }));
    }
    
    // Reset the formula to default (empty or =)
    resetFormula() {
        this.currentFormula = '=';
        document.getElementById('formula-editor').value = this.currentFormula;
        this.updateFormulaPreview();
    }
    
    // Insert a function into the formula editor
    insertFunction(func) {
        const formulaEditor = document.getElementById('formula-editor');
        const cursorPos = formulaEditor.selectionStart;
        
        // If it's an operator, just insert the symbol
        if (this.formulaComponents.operators.includes(func)) {
            const newFormula = 
                this.currentFormula.substring(0, cursorPos) + 
                ` ${func.name} ` + 
                this.currentFormula.substring(cursorPos);
                
            this.currentFormula = newFormula;
            formulaEditor.value = newFormula;
            
            // Set cursor position after inserted function
            formulaEditor.selectionStart = cursorPos + func.name.length + 2;
            formulaEditor.selectionEnd = formulaEditor.selectionStart;
        } else {
            // For functions, add the name and parentheses
            let insertText = `${func.name}()`;
            
            const newFormula = 
                this.currentFormula.substring(0, cursorPos) + 
                insertText + 
                this.currentFormula.substring(cursorPos);
                
            this.currentFormula = newFormula;
            formulaEditor.value = newFormula;
            
            // Set cursor position inside parentheses
            formulaEditor.selectionStart = cursorPos + func.name.length + 1;
            formulaEditor.selectionEnd = formulaEditor.selectionStart;
        }
        
        // Update the preview
        this.updateFormulaPreview();
        
        // Focus back on the editor
        formulaEditor.focus();
    }
    
    // Update the formula preview with syntax highlighting
    updateFormulaPreview() {
        const formulaEditor = document.getElementById('formula-editor');
        this.currentFormula = formulaEditor.value;
        
        // Apply syntax highlighting
        const preview = document.getElementById('formula-preview');
        preview.innerHTML = this.highlightSyntax(this.currentFormula);
    }
    
    // Apply syntax highlighting to formula
    highlightSyntax(formula) {
        // Ensure the formula starts with =
        if (!formula.startsWith('=') && formula.trim() !== '') {
            formula = '=' + formula;
        }
        
        // Replace functions with highlighted versions
        let highlighted = formula;
        
        // Highlight function names
        Object.values(this.formulaComponents).flat().forEach(func => {
            if (func.name.length > 1) { // Skip operators
                const regex = new RegExp(`(${func.name})\\(`, 'g');
                highlighted = highlighted.replace(regex, '<span class="formula-function">$1</span>(');
            }
        });
        
        // Highlight operators
        this.formulaComponents.operators.forEach(op => {
            const regex = new RegExp(`\\s(\\${op.name})\\s`, 'g');
            highlighted = highlighted.replace(regex, ' <span class="formula-operator">$1</span> ');
        });
        
        // Highlight numbers
        highlighted = highlighted.replace(/(\d+(\.\d+)?)/g, '<span class="formula-number">$1</span>');
        
        // Highlight cell references (e.g., A1, B2:C3)
        highlighted = highlighted.replace(/([A-Z]+[0-9]+(\:[A-Z]+[0-9]+)?)/g, 
            '<span class="formula-cell-ref">$1</span>');
            
        // Add styles if not present
        if (!document.getElementById('formula-highlight-styles')) {
            const styles = document.createElement('style');
            styles.id = 'formula-highlight-styles';
            styles.textContent = `
                .formula-function { color: #2196F3; font-weight: bold; }
                .formula-operator { color: #FF5722; font-weight: bold; }
                .formula-number { color: #4CAF50; }
                .formula-cell-ref { color: #9C27B0; font-weight: bold; }
                
                /* Animation for modal */
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-modal {
                    animation: slide-down 0.3s ease-out;
                }
            `;
            document.head.appendChild(styles);
        }
        
        return highlighted;
    }
    
    // Apply the formula and close the builder
    applyFormula() {
        // Here you would typically save the formula or perform some action with it
        // For now, we just close the builder and the event listener will handle the formula
        this.closeBuilder();
        
        // Show toast notification
        this.showToast('Formula applied successfully!');
    }
    
    // Show a toast notification
    showToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('formula-toasts');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'formula-toasts';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create and add the toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
        toastContainer.appendChild(toast);
        
        // Remove toast after animation completes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the formula builder when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.formulaBuilder = new FormulaBuilder();
});

// Get description for a function
function getFunctionDescription(functionName) {
    const descriptions = {
        'SUM': 'Adds all numbers in a range of cells',
        'AVERAGE': 'Calculates the average (arithmetic mean) of values',
        'COUNT': 'Counts the number of cells that contain numbers',
        'IF': 'Returns one value if a condition is true and another if false',
        'VLOOKUP': 'Looks for a value in the leftmost column and returns a value in the same row',
        'MAX': 'Returns the largest value in a set of values',
        'MIN': 'Returns the smallest value in a set of values',
        'CONCATENATE': 'Joins several text strings into one text string',
        'AND': 'Returns TRUE if all arguments are TRUE',
        'OR': 'Returns TRUE if any argument is TRUE',
        'NOT': 'Reverses the logic of an argument',
        'SUMIF': 'Adds values that meet a specific condition',
        'COUNTIF': 'Counts cells that meet a specific condition',
        'ROUND': 'Rounds a number to a specified number of digits',
        'TODAY': 'Returns the current date',
        'NOW': 'Returns the current date and time',
        'TRIM': 'Removes extra spaces from text',
        'LEFT': 'Returns a specified number of characters from the start of a text string',
        'RIGHT': 'Returns a specified number of characters from the end of a text string',
        'MID': 'Returns a specific number of characters from a text string, starting at a position you specify',
        'FIND': 'Returns the position of one text string within another (case-sensitive)',
        'SEARCH': 'Returns the position of one text string within another (not case-sensitive)',
        'LEN': 'Returns the number of characters in a text string',
        'INDEX': 'Returns a value from a specific position in a range or array',
        'MATCH': 'Returns the position of an item in a range that matches a value',
        'IFERROR': 'Returns a specified value if a formula evaluates to an error'
    };
    
    return descriptions[functionName] || `${functionName} function`;
}

// Provide a human-readable explanation of the formula
function explainFormula(formula) {
    if (!formula || formula === '=') {
        return 'Start by building your formula.';
    }
    
    try {
        // Remove '=' from the start for parsing
        const formulaContent = formula.startsWith('=') ? formula.substring(1) : formula;
        
        // Basic implementations - these would be far more sophisticated in a real application
        
        // Check for simple arithmetic
        if (/^[A-Z0-9:+\-*\/\s.()]+$/.test(formulaContent) && 
            !this.extractFunctions(formulaContent).length) {
            return 'This formula performs arithmetic calculations on the specified cell values or numbers.';
        }
        
        // Check for common functions
        const functions = this.extractFunctions(formulaContent);
        
        if (functions.length === 1) {
            const fn = functions[0];
            
            switch(fn) {
                case 'SUM':
                    return 'This formula adds up all values in the specified range.';
                case 'AVERAGE':
                    return 'This formula calculates the average (mean) of all values in the specified range.';
                case 'COUNT':
                    return 'This formula counts the number of cells containing numbers in the specified range.';
                case 'MAX':
                    return 'This formula finds the largest value in the specified range.';
                case 'MIN':
                    return 'This formula finds the smallest value in the specified range.';
                case 'IF':
                    return 'This formula performs a logical test and returns one value if the test evaluates to TRUE, and another if it evaluates to FALSE.';
                case 'VLOOKUP':
                    return 'This formula searches for a value in the first column of a table and returns a value in the same row from a column you specify.';
                case 'INDEX':
                    if (formulaContent.includes('MATCH')) {
                        return 'This INDEX/MATCH combination looks up and returns a value from a table based on matching criteria.';
                    }
                    return 'This formula returns a value from a specific position in a table or range.';
                default:
                    return `This formula uses the ${fn} function to perform a calculation.`;
            }
        }
        
        if (functions.length > 1) {
            return `This complex formula combines multiple functions (${functions.join(', ')}) to perform calculations.`;
        }
        
        return 'This formula performs a calculation based on the specified values and operations.';
        
    } catch (error) {
        return 'This formula structure is complex. Try simplifying it to see a clearer explanation.';
    }
}

// Copy formula to clipboard
function copyFormulaToClipboard() {
    try {
        // Get the formula from the editor
        const editor = document.getElementById('formula-editor');
        if (!editor) return;
        
        // Create a temporary text area to copy from
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = editor.value;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        // Show success message
        alert('Formula copied to clipboard!');
        
    } catch (error) {
        console.error('Failed to copy formula:', error);
        alert('Failed to copy formula. Please try again or copy manually.');
    }
}

// Initialize the formula builder when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add custom styles for formula syntax highlighting
    const style = document.createElement('style');
    style.textContent = `
        .formula-function {
            color: #0066cc;
            font-weight: bold;
        }
        
        .formula-operator {
            color: #cc6600;
        }
        
        .formula-reference {
            color: #008800;
        }
        
        .interactive-formula {
            cursor: pointer;
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            transition: background-color 0.2s;
        }
        
        .interactive-formula:hover {
            background-color: #e0e0e0;
        }
        
        .formula-component-list {
            list-style-type: disc;
            padding-left: 20px;
        }
        
        .formula-section {
            margin-bottom: 1rem;
            padding: 0.75rem;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        
        .formula-section h5 {
            margin-top: 0;
            color: var(--primary-color);
        }
        
        .formula-error {
            color: #d32f2f;
        }
    `;
    document.head.appendChild(style);
});
