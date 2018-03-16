class MAction {
    constructor(type, matrix, row, values) {
        this.type = type;
        this.matrix = matrix;
        this.row = row;
        this.values = values;
    }
}

let undoStack = [];
let redoStack = [];

function undo() {
    if (undoStack.length <= 0) {
        return;
    }
    const lastAction = undoStack.pop();

    if (lastAction.type == 0) { // Normal type
        let redoAction = new MAction(lastAction.type, lastAction.matrix, lastAction.row, lastAction.matrix.content[lastAction.row]);
        redoStack.push(redoAction);

        lastAction.matrix.content[lastAction.row] = lastAction.values;
    }
    else if (lastAction.type == 1) { // Swap type
        let redoAction = new MAction(lastAction.type, lastAction.matrix, lastAction.row, lastAction.values);
        redoStack.push(redoAction);

        let temp = [];
        for (let i = 0; i < lastAction.matrix.column; i++) {
            temp[i] = lastAction.matrix.content[lastAction.values.to][i];
            lastAction.matrix.content[lastAction.values.to][i] = lastAction.matrix.content[lastAction.values.from][i];
            lastAction.matrix.content[lastAction.values.from][i] = temp[i];
        }
    }

    lastAction.matrix.display();

}

function redo() {
    if (redoStack.length <= 0) {
        return;
    }
    const lastAction = redoStack.pop();

    if (lastAction.type == 0) { // Normal type
        let redoAction = new MAction(lastAction.matrix, lastAction.row, lastAction.matrix.content[lastAction.row]);
        undoStack.push(redoAction);

        lastAction.matrix.content[lastAction.row] = lastAction.values;
    }
    else if (lastAction.type == 1) { // Swap type
        let to = lastAction.values.to;
        let from = lastAction.values.from;
        let redoAction = new MAction(lastAction.matrix, lastAction.row, {to, from});
        undoStack.push(redoAction);

        let temp = [];
        for (let i = 0; i < lastAction.matrix.column; i++) {
            temp[i] = lastAction.matrix.content[lastAction.values.to][i];
            lastAction.matrix.content[lastAction.values.to][i] = lastAction.matrix.content[lastAction.values.from][i];
            lastAction.matrix.content[lastAction.values.from][i] = temp[i];
        }
    }

    lastAction.matrix.display();
}

function getGCD(a, b) {
	return b ? getGCD(b, a % b) : a;
}

class MNumber {
    constructor(top, bottom) {
        this.top = top;

		if (typeof bottom === 'undefined') {
			this.bottom = 1;
		} else {
			this.bottom = bottom;
		}
		
		this.reduce();
	}
	
	reduce() {
		const gcd = getGCD(this.top, this.bottom);
		
		this.top /= gcd;
		this.bottom /= gcd;
	}
	
	displayValue() {
		if (this.bottom === 1) {
            //console.log(this.top);
            return this.top;
		} else {
            //console.log(`${this.top}/${this.bottom}`);
            return `${this.top}/${this.bottom}`;
		}
    }
    
    // No need for subtracting/division cuz subtract is + -
    add(top, bottom) {
        if (typeof bottom === 'undefined') { // i.e whole number
            bottom = this.bottom;
            top *= bottom;
    
            this.top += top;
        }
        else {
            this.top = this.top * bottom + top * this.bottom;
            this.bottom *= bottom;
        }
        this.reduce();
    }

    multiply(top, bottom) {
        this.top *= top;

        if (typeof bottom !== 'undefined') {
            this.bottom *= bottom;
        }

        this.reduce();
    }
    
    divide(top, bottom) {
        if (typeof bottom !== 'undefined') {
            this.top *= bottom;
        }

        this.bottom *= top;

        this.reduce();
    }
}

class Matrix {
	constructor(row, column, result) {
		this.row = row;
		this.column = column;
		this.result = result;
		
		this.content = new Array(row);
		for (let i = 0; i < row; i++) {
			this.content[i] = new Array(column);
		}
	}
	
	display() {
		for (let r = 0; r < this.row; r++) {
            var text = "[";
			for (let c = 0; c < this.column; c++) {
				text += this.content[r][c].displayValue() + " ";
            }
            text += "]";
            console.log(text);
		}	
    }
    
    swapRow(from, to) {
        let newAction = new MAction(1, this, to, {from, to});
        undoStack.push(newAction);

        let temp = [];
        for (let i = 0; i < this.column; i++) {
            temp[i] = this.content[to][i];
            this.content[to][i] = this.content[from][i];
            this.content[from][i] = temp[i];
        }

        redoStack = [];
        
        this.display();
    }

    doOperation(to, op, top, bottom) {
        let previous = [];
        
        for (let i = 0; i < this.column; i++) {
            previous[i] = new MNumber(this.content[to][i].top, this.content[to][i].bottom);
            switch (op) {
            case 0: // Add
                this.content[to][i].add(top, bottom);
                break;
            case 1: // Subtract
                this.content[to][i].add(-top, bottom);
                break;
            case 2: // Mult.
                this.content[to][i].multiply(top, bottom);
                break;
            case 3: // Division.
                this.content[to][i].divide(top, bottom);
                break;
            }
        }

        let newAction = new MAction(0, this, to, previous);
        undoStack.push(newAction);
        redoStack = [];

        this.display();
    }

    rowOperation(to, op, from) {
        let previous = [];

        for (let i = 0; i < this.column; i++) {
            previous[i] = new MNumber(this.content[to][i].top, this.content[to][i].bottom);
            switch (op) {
            case 0: // Add
                this.content[to][i].add(this.content[from][i].top, this.content[from][i].bottom);
                break;
            case 1: // Subtract
                this.content[to][i].add(-this.content[from][i].top, this.content[from][i].bottom);
                break;
            case 2: // Mult.
                this.content[to][i].multiply(this.content[from][i].top, this.content[from][i].bottom);
                break;
            case 3: // Division.
                this.content[to][i].divide(this.content[from][i].top, this.content[from][i].bottom);
                break;
            }
        }

        let newAction = new MAction(0, this, to, previous);
        undoStack.push(newAction);
        redoStack = [];

        this.display();
    }
}

const test = new Matrix(5, 5, false);
test.content[0][0] = new MNumber(1); 

test.content[0][1] = new MNumber(1); test.content[0][2] = new MNumber(1); test.content[0][3] = new MNumber(1); test.content[0][4] = new MNumber(1);

test.content[1][0] = new MNumber(1); test.content[1][1] = new MNumber(5); test.content[1][2] = new MNumber(2); test.content[1][3] = new MNumber(3); test.content[1][4] = new MNumber(4);

test.content[2][0] = new MNumber(3); test.content[2][1] = new MNumber(9); test.content[2][2] = new MNumber(6); test.content[2][3] = new MNumber(4); test.content[2][4] = new MNumber(1);

test.content[3][0] = new MNumber(2); test.content[3][1] = new MNumber(1); test.content[3][2] = new MNumber(1); test.content[3][3] = new MNumber(1); test.content[3][4] = new MNumber(1);

test.content[4][0] = new MNumber(1); test.content[4][1] = new MNumber(3); test.content[4][2] = new MNumber(1); test.content[4][3] = new MNumber(1); test.content[4][4] = new MNumber(1);

test.display();