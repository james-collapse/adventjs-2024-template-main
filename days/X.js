// Made by James Walker

function dayXPreload() {

    // Load any assets here (with assets.dayX at the front of the variable name)
}

class DayX extends Day {

    constructor () {

        super();
        this.loop = true; // Set to true or false

        this.controls =
            "CLICK to regenerate, A to toggle autoplay, C to toggle centre repeat, X to export";
        this.credits = "Made by James Walker";

        // Define variables here. Runs once during the sketch holder setup
        this.w; // Cell width (pixels)
        this.h; // Cell height (pixels)
        this.columns; // No. columns
        this.rows; // No. rows
        this.light = color('#EAE8DB'); // Background colour
        this.dark = color('#3A457A'); // Foreground colour
        this.pencil = color('grey'); // Grid line colour
        this.cells = [[]]; // 2D array
        this.borderRemoved = true;
        this.centreRepeatRemoved = false;
        this.autoplay = false;
        this.frameInterval; // No. frames between generations
    }

    prerun() {

        // Initialise/reset variables here. Runs once, every time your day is viewed

        // Set cell width and height
        this.w = 20;
        this.h = 20;

        // Set interval between generations
        this.frameInterval = 30;

        this.reset();
        this.update();
        this.next();
    }

    reset() {
        // Create empty 2D array to fill one-quarter of canvas
        this.columns = (width / 2) / this.w; 
        this.rows = (height / 2) / this.h;
        this.cells = this.create2DArray(this.columns, this.rows);

        // Initialise array (set centre cell to 1)
        this.cells[floor(this.columns / 2)][floor(this.rows / 2)] = 1;
    }

    update() {

        // Update and draw stuff here. Runs continuously (or only once if this.loop = false), while your day is being viewed.

        background(this.light);

        let rx = this.reflectX(this.cells);
        let ry = this.reflectY(rx);

        push();

        if (this.centreRepeatRemoved) {
            translate(this.w / 2, this.h / 2);
        }
        this.renderGrid();
        this.renderCells(ry);

        pop();

        if (this.autoplay) {
            this.autorun();
        }
    }

    renderGrid() {
        stroke(this.pencil);
        strokeWeight(0.4);
        push();
        translate(- this.w / 2, - this.h / 2);
        // Render vertical lines
        for (let i = -0.5; i < 2 * this.columns; i++) {
            line(i * this.w, -this.h, i * this.w, height + this.h);
        }
        // Render horizontal lines
        for (let j = -0.5; j < 2 * this.rows; j++) {
            line(-this.w, j * this.h, width + this.w, j * this.h);
        }
        pop();
    }

    renderCells(arr) {
        for (let i in arr) {
            for (let j in arr[i]) {
                let v = arr[i][j];
                if (v === 1) {
                    fill(this.dark);
                    square(i * this.w, j * this.h, this.w * 0.9);
                }
            }
        }
    }

    // Automatically compute next generation
    autorun() {
        if (frameCount % this.frameInterval === 0) {
            this.next();
        }
    }

    /// CA

    // Compute next generation
    next() {
        // Create a copy of the current cells
        let newCells = this.cells.slice();

        // Apply rule (but not at edges)
        for (let i = 1; i < this.cells.length - 1; i++) {
            for (let j = 1; j < this.cells[i].length - 1; j++) {
                newCells[i][j] = this.evaluate(i, j);
            }
        }

        this.cells = newCells;
    }

    // Evaluate the next generation for cell (i, j)
    evaluate(i, j) {
        // Get values of neighbouring cells
        let ns = this.neighbours(i, j);

        // If odd, set value of cell (i, j) to 0, otherwise set to 1
        let total = 0;

        for (let i in ns) {
            total += ns[i];
        }

        if (total === 1 || total === 3) {
            return 0;
        } else {
            return 1;
        }
    }

    // Get values of cells neighbouring cell (i, j)
    neighbours(i, j) {
        let n = this.cells[i - 1][j];
        let e = this.cells[i][j + 1];
        let s = this.cells[i + 1][j];
        let w = this.cells[i][j - 1];

        return [n, e, s, w];
    }


    /// Array helpers

    // Create empty 2D array by size
    create2DArray(columns, rows) {
        let arr = new Array(columns);
        for (let i = 0; i < columns; i++) {
            arr[i] = new Array(rows);
            for (let j = 0; j < rows; j++) {
                arr[i][j] = 0;
            }
        }
        return arr;
    }

    // Reflect along X-axis
    reflectX(arr) {
        let copy = arr.slice();

        // For each column
        for (let i in copy) {
            let c = copy[i].slice();

            if (this.borderRemoved) {
                shorten(c); // Remove last row
                splice(c, [0], 0); // Insert empty row at beginning
            }

            let r = reverse(c.slice());

            // Remove first row if centre repeat removed
            if (this.centreRepeatRemoved) {
                r.shift();
            }

            let p = this.combine(c, r);
            copy[i] = p;
        }

        return copy;
    }

    reflectY(arr) {
        if (this.borderRemoved) {
            shorten(arr); // Remove last column
            let emptyColumn = arr[0];
            splice(arr, [emptyColumn], 0); // Insert empty column at beginning
        }

        return this.combine(arr, this.flipY(arr));
    }

    // Flip 2D array along Y-axis
    flipY(arr) {
        let copy = arr.slice();

        copy.reverse();

        // Skip first column if centre repeat removed
        if (this.centreRepeatRemoved) {
            copy.shift();
        }

        return copy;
    }

    // Combine two arrays
    combine(arr1, arr2) {
        let copy1 = arr1.slice();
        let copy2 = arr2.slice();

        return copy1.concat(copy2);
    }

    // Below are optional functions for interactivity

    mousePressed() {
        if (!this.autoplay) {
            this.next();
        }
    }

    mouseReleased() {

    }

    keyPressed() {
        if (key === 'c' || key === 'C') {
            this.centreRepeatRemoved = !this.centreRepeatRemoved;
        }
        
        if (key === 'x' || key === 'X') {
            saveCanvas();
        }

        if (key === 'a' || key === 'A') {
            this.autoplay = !this.autoplay;
        }
    }

    keyReleased() {

    }

    // Below is an example basic setup for a nested class. This can be renamed

    HelperClass = class {

        constructor() {

        }
    }
}