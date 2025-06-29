class CarpetCalculator {
    constructor() {
        this.currentShape = 'rectangle';
        this.shapeUnits = {};
        this.builtupUnits = { area: 'sq ft', deduction: 'sq ft' };
        
        this.initializeUnits();
        this.bindEvents();
        this.updateFormula(this.currentShape);
    }

    // Initialize default units for all inputs
    initializeUnits() {
        this.shapeUnits = {
            width: 'ft', 
            length: 'ft', 
            radius: 'ft',
            axisA: 'ft', 
            axisB: 'ft', 
            pentagonSide: 'ft', 
            hexagonSide: 'ft'
        };
    }

    // Bind all event listeners
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Shape selection
        document.querySelectorAll('.shape-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectShape(e.currentTarget.dataset.shape));
        });

        // Unit toggles
        document.querySelectorAll('.unit-btn').forEach(button => {
            button.addEventListener('click', (e) => this.toggleUnit(e.target));
        });

        // Calculate buttons
        document.getElementById('calculateShapeBtn').addEventListener('click', () => this.calculateShapeArea());
        document.getElementById('calculateBuiltupBtn').addEventListener('click', () => this.calculateCarpetArea());

        // Radio button changes
        document.querySelectorAll('input[name="deductionType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleDeductionTypeChange(e.target.value));
        });

        // Radio option styling
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    this.updateRadioSelection();
                    this.handleDeductionTypeChange(radio.value);
                }
            });
        });

        // Input validation
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', (e) => this.validateInput(e.target));
        });
    }

    // Tab switching functionality
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }

    // Shape selection functionality
    selectShape(shape) {
        this.currentShape = shape;
        
        // Update active shape card
        document.querySelectorAll('.shape-card').forEach(card => card.classList.remove('active'));
        document.querySelector(`[data-shape="${shape}"]`).classList.add('active');
        
        // Hide all shape inputs
        document.querySelectorAll('.shape-inputs').forEach(input => input.style.display = 'none');
        
        // Show selected shape inputs
        const selectedInputs = document.getElementById(`${shape}-inputs`);
        if (selectedInputs) {
            selectedInputs.style.display = 'block';
        }
        
        // Update formula display
        this.updateFormula(shape);
        
        // Clear previous results
        this.clearResult('shape-result');
    }

    // Update formula display based on selected shape
    updateFormula(shape) {
        const formulas = {
            rectangle: 'Area = Width × Length',
            circle: 'Area = π × Radius²',
            ellipse: 'Area = A-axis × B-axis × π',
            pentagon: 'Area = Side² × √(25 + 10√5) / 4',
            hexagon: 'Area = (3/2) × √3 × Side²'
        };
        
        const formulaElement = document.getElementById('formula');
        if (formulaElement) {
            formulaElement.textContent = formulas[shape] || 'Select a shape';
        }
    }

    // Unit toggle functionality
    toggleUnit(button) {
        const unitSelector = button.parentElement;
        const inputContainer = unitSelector.parentElement;
        const input = inputContainer.querySelector('input');
        
        // Update active unit button
        unitSelector.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Store unit preference
        const inputId = input.id;
        const unit = button.dataset.unit;
        
        if (inputId === 'builtupArea') {
            this.builtupUnits.area = unit;
        } else if (inputId === 'deductionFixed') {
            this.builtupUnits.deduction = unit;
        } else if (this.shapeUnits.hasOwnProperty(inputId)) {
            this.shapeUnits[inputId] = unit;
        }
    }

    // Handle deduction type change
    handleDeductionTypeChange(type) {
        const percentageInput = document.getElementById('percentage-input');
        const fixedInput = document.getElementById('fixed-input');
        
        if (type === 'percentage') {
            percentageInput.style.display = 'block';
            fixedInput.style.display = 'none';
        } else {
            percentageInput.style.display = 'none';
            fixedInput.style.display = 'block';
        }
        
        this.clearResult('buildup-result');
    }

    // Update radio selection styling
    updateRadioSelection() {
        document.querySelectorAll('.radio-option').forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio.checked) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    // Input validation
    validateInput(input) {
        const value = parseFloat(input.value);
        
        if (input.hasAttribute('min') && value < parseFloat(input.min)) {
            input.value = input.min;
        }
        
        if (input.hasAttribute('max') && value > parseFloat(input.max)) {
            input.value = input.max;
        }
        
        // Remove leading zeros
        if (input.value.length > 1 && input.value.startsWith('0') && input.value[1] !== '.') {
            input.value = input.value.replace(/^0+/, '');
        }
    }

    // Calculate area for different shapes
    calculateShapeArea() {
        let area = 0;
        let unit = '';
        
        try {
            switch(this.currentShape) {
                case 'rectangle':
                    const width = this.getInputValue('width');
                    const length = this.getInputValue('length');
                    if (!width || !length) throw new Error('Please enter valid width and length');
                    area = width * length;
                    unit = this.shapeUnits.width === 'ft' ? 'sq ft' : 'sq m';
                    break;
                    
                case 'circle':
                    const radius = this.getInputValue('radius');
                    if (!radius) throw new Error('Please enter valid radius');
                    area = Math.PI * radius * radius;
                    unit = this.shapeUnits.radius === 'ft' ? 'sq ft' : 'sq m';
                    break;
                    
                case 'ellipse':
                    const axisA = this.getInputValue('axisA');
                    const axisB = this.getInputValue('axisB');
                    if (!axisA || !axisB) throw new Error('Please enter valid A-axis and B-axis values');
                    area = axisA * axisB * Math.PI;
                    unit = this.shapeUnits.axisA === 'ft' ? 'sq ft' : 'sq m';
                    break;
                    
                case 'pentagon':
                    const pentSide = this.getInputValue('pentagonSide');
                    if (!pentSide) throw new Error('Please enter valid side length');
                    area = (pentSide * pentSide * Math.sqrt(25 + 10 * Math.sqrt(5))) / 4;
                    unit = this.shapeUnits.pentagonSide === 'ft' ? 'sq ft' : 'sq m';
                    break;
                    
                case 'hexagon':
                    const hexSide = this.getInputValue('hexagonSide');
                    if (!hexSide) throw new Error('Please enter valid side length');
                    area = (3 * Math.sqrt(3) * hexSide * hexSide) / 2;
                    unit = this.shapeUnits.hexagonSide === 'ft' ? 'sq ft' : 'sq m';
                    break;
                    
                default:
                    throw new Error('Please select a valid shape');
            }
            
            this.displayResult('shape-result', area, unit);
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Calculate carpet area from built-up area
    calculateCarpetArea() {
        try {
            const builtupArea = this.getInputValue('builtupArea');
            if (!builtupArea) throw new Error('Please enter valid built-up area');
            
            let deduction = 0;
            const deductionType = document.querySelector('input[name="deductionType"]:checked')?.value;
            
            if (deductionType === 'percentage') {
                const deductionPercent = this.getInputValue('deductionPercent');
                if (deductionPercent < 0 || deductionPercent > 100) {
                    throw new Error('Please enter valid percentage (0-100)');
                }
                deduction = (builtupArea * deductionPercent) / 100;
            } else {
                const deductionFixed = this.getInputValue('deductionFixed');
                if (deductionFixed < 0) throw new Error('Please enter valid fixed deduction');
                
                // Convert units if necessary
                deduction = this.convertUnits(deductionFixed, this.builtupUnits.deduction, this.builtupUnits.area);
            }
            
            const carpetArea = builtupArea - deduction;
            if (carpetArea < 0) throw new Error('Deduction cannot be greater than built-up area');
            
            this.displayResult('buildup-result', carpetArea, this.builtupUnits.area);
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Helper function to get input value
    getInputValue(inputId) {
        const input = document.getElementById(inputId);
        return input ? parseFloat(input.value) || 0 : 0;
    }

    // Convert units between sq ft and sq m
    convertUnits(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        
        if (fromUnit === 'sq ft' && toUnit === 'sq m') {
            return value / 10.764;
        } else if (fromUnit === 'sq m' && toUnit === 'sq ft') {
            return value * 10.764;
        }
        
        return value;
    }

    // Display calculation result
    displayResult(elementId, area, unit) {
        const resultElement = document.getElementById(elementId);
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="result-value">${this.formatNumber(area)}</div>
                <div class="result-label">${unit}</div>
            `;
            resultElement.classList.add('show');
        }
    }

    // Clear result display
    clearResult(elementId) {
        const resultElement = document.getElementById(elementId);
        if (resultElement) {
            resultElement.classList.remove('show');
        }
    }

    // Format number with appropriate decimal places
    formatNumber(num) {
        if (num < 1) {
            return num.toFixed(3);
        } else if (num < 100) {
            return num.toFixed(2);
        } else {
            return num.toFixed(1);
        }
    }

    // Show error message
    showError(message) {
        // Create a modern toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-message">${message}</div>
        `;
        
        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(238, 90, 82, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '300px',
            fontSize: '14px',
            fontWeight: '600'
        });
        
        document.body.appendChild(toast);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
}

// Add CSS animations for toast notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarpetCalculator();
});