/* CONSTANTS AND GLOBALS */

const TABLE_WIDTH = 85;
const TABLE_HEIGHT = 95;

const TABLE = document.getElementById('table');

const TABLE_SIZE = {
    r: 48,
    c: 80,
};

let lifeMap = [];

let autoStepOn = false;
let autoStepInterval;

/* UTILITY FUNCTIONS */

// Converts from row, column coords to id string; (r, c) -> "r.c"
function toId(r, c) {
    return r + '.' + c;
}

// Converts from id string to row, column coords; "r.c" -> (r, c)
function fromId(id) {
    const split = id.split('.');
    const coords = {
        r: split[0],
        c: split[1],
    };
    return coords;
}

// TODO Document
function toggleCell(id) {
    document.getElementById(id).classList.toggle('dead');
    document.getElementById(id).classList.toggle('alive');
}

/* GAME TABLE FUNCTIONALITY */

// TODO Document
function iterateThroughTable(eachCell, eachRow = () => { }) {
    // iterates through every row
    for (let r = 0; r < TABLE_SIZE.r; r++) {
        eachRow(r);
        // iterates through every column of every row
        for (let c = 0; c < TABLE_SIZE.c; c++) {
            eachCell(r, c);
        }
    }
}

// TODO Document
function buildTable() {
    // Refit grid size on table rebuild
    fitGrid();

    const eachRow = r => {
        const row = document.createElement('div');
        row.id = r;
        row.classList.add('row');
        TABLE.appendChild(row);
    };

    const eachCell = (r, c) => {
        const id = toId(r, c);
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.classList.add('dead');
        cell.id = id;
        cell.onclick = () => {
            toggleCell(id);
        }
        document.getElementById(r).appendChild(cell);
    };

    iterateThroughTable(eachCell, eachRow);
}

// TODO Document
function deleteTable() {
    while (TABLE.hasChildNodes()) {
        TABLE.removeChild(TABLE.firstChild);
    }
}

// TODO Document
function fitGrid() {
    const hCellRatio = (TABLE_WIDTH / TABLE_SIZE.c) / (document.documentElement.clientHeight / document.documentElement.clientWidth);
    const vCellRatio = TABLE_HEIGHT / TABLE_SIZE.r;

    const gridSize = Math.min(hCellRatio, vCellRatio);

    document.documentElement.style.setProperty(
        '--cell-size',
        gridSize + 'vh'
    );
}

/* BUTTON AND CORE GAME FUNCTIONALITY */

// TODO Document
function stepGame() {

    // Local life map variable
    let m_lifeMap = [];

    // On each row initialize array for 2d array
    const eachRow = r => {
        m_lifeMap[r] = [];
    };

    // For each cell fill out life map
    const eachCell = (r, c) => {
        m_lifeMap[r][c] = document.getElementById(toId(r, c)).classList.contains('alive');
    }

    // Iterate through table
    iterateThroughTable(eachCell, eachRow);

    // Set global map to local map
    lifeMap = m_lifeMap;

    // Apply game rules and change cell state
    gameRules();
}

// TODO Document
function gameRules() {

    // For each cell run Conway's game of life rules
    const eachCell = (r, c) => {

        // Convert (r, c) to id
        const id = toId(r, c);

        // Check if cell is alive
        const alive = lifeMap[r][c];

        // Count alive neighbors
        const neighbors = countNeighbors(r, c, alive);

        // Apply Conway's game of life rules
        if (alive && (neighbors < 2 || neighbors > 3)) {
            toggleCell(id);
        } else if (!alive && neighbors === 3) {
            toggleCell(id);
        }
    }

    // Iterate through table
    iterateThroughTable(eachCell);
}

// TODO Document
function countNeighbors(r, c, alive) {

    // Size of table
    let rows = TABLE_SIZE.r;
    let cols = TABLE_SIZE.c;

    // Bounds for neighbor calculations
    let bounds = {
        r1: r > 0 ? r - 1 : 0,
        c1: c > 0 ? c - 1 : 0,
        r2: r < rows - 1 ? r + 1 : rows - 1,
        c2: c < cols - 1 ? c + 1 : cols - 1,
    };

    // If alive, decrease sum by 1 to not include self
    var sum = alive ? -1 : 0;

    // Iterates through range of neighbor bounds, increments sum if any cell is alive within range.
    for (let r = bounds.r1; r <= bounds.r2; r++) {
        for (let c = bounds.c1; c <= bounds.c2; c++) {
            sum += lifeMap[r][c] ? 1 : 0;
        }
    }

    return sum;
}

// TODO Document & ADD CUSTOM TIMING AND STUFF LATER
function autoStepHandler() {
    if (autoStepOn) {
        clearInterval(autoStepInterval);
        autoStepOn = false;
    } else {
        autoStepInterval = setInterval(stepGame, 100);
        autoStepOn = true;
    }
}

// TODO Document
function clearTable() {

    // Kill each cell
    const killCell = (r, c) => {

        // Convert from (r, c) to id
        const id = toId(r, c);

        // Kill cell
        document.getElementById(id).classList.add('dead');
        document.getElementById(id).classList.remove('alive');
    }

    // Disable auto stepping
    clearInterval(autoStepInterval);
    autoStepOn = false;

    // Iterate through table
    iterateThroughTable(killCell);
}


/* GRID DRAG SELECTION FUNCTIONALITY  */

// Begin selection on mouse down of a cell
window.addEventListener('mousedown', e => {

    // If the mouse down starts on something that is a cell, start the selection
    if (document.getElementById(e.target.id).classList.contains('cell')) {
        this.selectionStart = e.target.id
    } else {
        this.selectionStart = null;
    }
});

// Show what is currently selected while mouse is still held down
window.addEventListener('mouseover', e => {

    // Applies 'selected' class to everything between the selection start and whatever cell the mouse is currently over
    if (this.selectionStart != null && document.getElementById(e.target.id).classList.contains('cell')) {
        const coordsStart = fromId(this.selectionStart);
        const coordsHere = fromId(e.target.id);

        const startRow = Math.min(coordsStart.r, coordsHere.r);
        const endRow = Math.max(coordsStart.r, coordsHere.r);

        const startCol = Math.min(coordsStart.c, coordsHere.c);
        const endCol = Math.max(coordsStart.c, coordsHere.c);

        iterateThroughTable((r, c) => {
            const cell = document.getElementById(toId(r, c));
            if (r >= startRow && r <= endRow && c >= startCol && c <= endCol) {
                cell.classList.add('selected');
            } else {
                cell.classList.remove('selected');
            }
        })
    }
});

// On mouse up fill in grid the selected area between the selection start point and the selection end point
window.addEventListener('mouseup', e => {

    // Makes every cell alive between the selection start and the selection end
    if (this.selectionStart != null && document.getElementById(e.target.id).classList.contains('cell') && this.selectionStart != e.target.id) {
        const coordsStart = fromId(this.selectionStart);
        const coordsHere = fromId(e.target.id);

        const startRow = Math.min(coordsStart.r, coordsHere.r);
        const endRow = Math.max(coordsStart.r, coordsHere.r);

        const startCol = Math.min(coordsStart.c, coordsHere.c);
        const endCol = Math.max(coordsStart.c, coordsHere.c);

        iterateThroughTable((r, c) => {
            const cell = document.getElementById(toId(r, c));
            if (r >= startRow && r <= endRow && c >= startCol && c <= endCol) {
                cell.classList.add('alive');
                cell.classList.remove('dead');
            }
        })
    }

    // Remove the 'selected' class from every cell since selection is over
    iterateThroughTable((r, c) => {
        const cell = document.getElementById(toId(r, c));
        cell.classList.remove('selected');
    })

    // No selection exists, null start point
    this.selectionStart = null;
});

/* SET UP WEB PAGE AND ADD INTERACTABILITY */

// Build DOM
document.getElementById('stepBtn').onclick = stepGame;
document.getElementById('autoStepBtn').onclick = autoStepHandler;
document.getElementById('clearBtn').onclick = clearTable;
buildTable();