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
        let temp = [];
        for (let i = 0; i < this.column; i++) {
            temp[i] = this.content[to][i];
            this.content[to][i] = this.content[from][i];
            this.content[from][i] = temp[i];
        }
    }

    doOperation(to, op, top, bottom) {
        for (let i = 0; i < this.column; i++) {
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
    }

    rowOperation(to, op, from) {
        for (let i = 0; i < this.column; i++) {
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