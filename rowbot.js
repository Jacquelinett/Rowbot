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
	constructor(row, column, result, variable) {
		this.row = row;
		this.column = column;
        this.result = result;
        this.variable = variable;
		
		this.content = new Array(row);
		for (let i = 0; i < row; i++) {
			this.content[i] = new Array(column);
		}
	}
	
	display() {
		for (let r = 0; r < this.row; r++) {
            let text = "[";
			for (let c = 0; c < this.column; c++) {
                if (this.result && c == this.column - 1)
                    text += "| ";
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

    rowOperation(to, op, from, multop, mulbot) {
        let previous = [];

        if (typeof multop === 'undefined') {
            mul = 1;
        }

        if (typeof mulbot === 'undefined') {
            mul = 1;
        }

        for (let i = 0; i < this.column; i++) {
            previous[i] = new MNumber(this.content[to][i].top, this.content[to][i].bottom);
            switch (op) {
            case 0: // Add
                this.content[to][i].add(this.content[from][i].top * multop, this.content[from][i].bottom * mulbot);
                break;
            case 1: // Subtract
                this.content[to][i].add(-this.content[from][i].top * multop, this.content[from][i].bottom * mulbot);
                break;
            case 2: // Mult.
                this.content[to][i].multiply(this.content[from][i].top * multop, this.content[from][i].bottom * mulbot);
                break;
            case 3: // Division.
                this.content[to][i].divide(this.content[from][i].top * multop, this.content[from][i].bottom * mulbot);
                break;
            }
        }

        let newAction = new MAction(0, this, to, previous);
        undoStack.push(newAction);
        redoStack = [];

        this.display();
    }
}

function getNumber(text) {
    let top = 1;
    let bot = 1;

    if (text.length == 0 || isNaN(text[1]))
        return new MNumber(1);

    let divIndex = text.indexOf("/");
    if (divIndex > 0)
        return new MNumber(parseInt(text.substring(0, divIndex)), text.substring(divIndex + 1));
    else
        return new MNumber(parseInt(text));

    return null;
}

class MatrixViewer {
    constructor(table) {
        this.table = table;
    }

    parseData(input) {
        let rows = input.split("\n");
        let uniqueVariables = "";

        let dictionary = new Array(rows.length);

        let haveResult = false;
        let result = new Array();
        
        for (let r = 0; r < rows.length; r++) {
            dictionary[r] = new Array();
            let lastOp = true; // This is to check if there is an operator between two numbers
            let lastNeg = false;

            rows[r].replace(/ /g,''); // Remove all white space

            for (let c = 0; c < rows[r].length; c++) {
                if (rows[r][c] === '+' || rows[r][c] === "-") {
                    if (lastOp) {
                        onErr("ERROR: Bad format");
                        return;
                    }
                    lastOp = true;
                    
                    if (rows[r][c] === '-')
                        lastNeg = true;

                    rows[r] = rows[r].substring(c + 1); //remove the stuff behind to start fresh
                    c = -1;
                }

                else if (rows[r][c] === '=') {
                    if (lastOp) {
                        onErr("ERROR: Bad format");
                        return;
                    }

                    haveResult = true;
                    rows[r] = rows[r].substring(c + 1);
        
                    let num = getNumber(rows[r]);
                    if (typeof num === 'undefined') {
                        onErr("ERROR: Bad format");
                        return;
                    }

                    result[r] = num;
                }

                else if (rows[r][c].match(/[a-z]/i)) {
                    if (!lastOp) {
                        onErr("ERROR: Bad format");
                        return;
                    }

                    if (uniqueVariables.indexOf(rows[r][c]) < 0)
                        uniqueVariables += rows[r][c];

                    let num = getNumber(rows[r].substring(0, c));
                    if (lastNeg) {
                        lastNeg = false;
                        num.multiply(-1);
                    }

                    if (typeof dictionary[r][rows[r][c]] === 'undefined') {
                        dictionary[r][rows[r][c]] = num;
                    }
                    else {
                        dictionary[r][rows[r][c]].add(num);
                    }
                        

                    rows[r] = rows[r].substring(c + 1);
                    c = -1;
                    lastOp = false;
                }
            }
        }

        this.matrix = new Matrix(rows.length, uniqueVariables.length + (haveResult ? 1 : 0), haveResult, uniqueVariables);

        for (let y = 0; y < rows.length; y++) {
            for (let x = 0; x < uniqueVariables.length; x++) {
                if (typeof dictionary[y][uniqueVariables[x]] === 'undefined') 
                    this.matrix.content[y][x] = new MNumber(0);
                
                else
                    this.matrix.content[y][x] = dictionary[y][uniqueVariables[x]];
            }
        }

        if (haveResult) {
            for (let i = 0; i < result.length; i++) {
                if (typeof result[i] === 'undefined') 
                    this.matrix.content[i][uniqueVariables.length] = new MNumber(0);
                else
                    this.matrix.content[i][uniqueVariables.length] = result[i];
            }
        }

        this.matrix.display();
        this.displayMatrix();
    }

    displayMatrix() {
        this.table.innerHTML = "";

        for (let y = -1; y < this.matrix.row; y++) {
            this.table.insertRow();
            
            for (let x = 0; x < this.matrix.column; x++) {
                this.table.rows[y + 1].insertCell();
                if (y == -1) {
                    if (x == this.matrix.variable.length)
                        this.table.rows[y + 1].cells[x].innerHTML = "&emsp; | &emsp; =";
                    else
                        this.table.rows[y + 1].cells[x].innerHTML = this.matrix.variable[x];
                }
                else {
                    this.table.rows[y + 1].cells[x].innerHTML = "";
                    
                    let num = this.matrix.content[y][x];
                    
                    if (x == this.matrix.variable.length)
                        this.table.rows[y + 1].cells[x].innerHTML += "&emsp; | &emsp; ";
                    if (num.bottom == 1)
                        this.table.rows[y + 1].cells[x].innerHTML += num.top;
                    else
                        this.table.rows[y + 1].cells[x].innerHTML += "<sup>" + num.top + "</sup> &frasl; <sub>" + num.bottom + "</sub>";
                }
            }
        }
    }
}

const viewer = new MatrixViewer(document.getElementById("matrix"));

function onErr(msg) {
    document.getElementById("onErr").innerHTML = msg;
    console.log("ERROR BAD FORMAT");
}

function parse() {
    viewer.parseData(document.getElementById("matrixInput").value);
}

/*const test = new Matrix(5, 5, false, "");
test.content[0][0] = new MNumber(1); 

test.content[0][1] = new MNumber(1); test.content[0][2] = new MNumber(1); test.content[0][3] = new MNumber(1); test.content[0][4] = new MNumber(1);

test.content[1][0] = new MNumber(1); test.content[1][1] = new MNumber(5); test.content[1][2] = new MNumber(2); test.content[1][3] = new MNumber(3); test.content[1][4] = new MNumber(4);

test.content[2][0] = new MNumber(3); test.content[2][1] = new MNumber(9); test.content[2][2] = new MNumber(6); test.content[2][3] = new MNumber(4); test.content[2][4] = new MNumber(1);

test.content[3][0] = new MNumber(2); test.content[3][1] = new MNumber(1); test.content[3][2] = new MNumber(1); test.content[3][3] = new MNumber(1); test.content[3][4] = new MNumber(1);

test.content[4][0] = new MNumber(1); test.content[4][1] = new MNumber(3); test.content[4][2] = new MNumber(1); test.content[4][3] = new MNumber(1); test.content[4][4] = new MNumber(1);

test.display();*/