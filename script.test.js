/* CONSTANTS AND GLOBALS */

const TABLE_WIDTH = 85;
const TABLE_HEIGHT = 95;

const TABLE = document.getElementById('table');

const TABLE_SIZE = {
    r: 24,
    c: 40,
};

let lifeMap = [];

let autoStepOn = false;
let autoStepInterval;

/* UTILITY FUNCTIONS */

// Converts from row, column coords to id string; (r, c) -> 'r.c'
function toId(r, c) {
    return r + '.' + c;
}

// Converts from id string to row, column coords; 'r.c' -> (r, c)
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

    const coords = fromId(id);
    // lifeMap[coords.r][coords.c] = !lifeMap[coords.r][coords.c]
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

        lifeMap[r] = [];
    };

    const eachCell = (r, c) => {
        const id = toId(r, c);
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.classList.add('dead');
        cell.id = id;
        cell.onclick = () => {
            toggleCell(id);
            lifeMap[r][c] = !lifeMap[r][c]
        }
        document.getElementById(r).appendChild(cell);

        lifeMap[r][c] = false;
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
    const btn = document.getElementById('autoStepBtn');
    if (autoStepOn) {
        clearInterval(autoStepInterval);
        btn.classList.remove('on');
        autoStepOn = false;
    } else {
        autoStepInterval = setInterval(stepGame, 100);
        btn.classList.add('on')
        autoStepOn = true;
    }
}

// Clears the game table, resets the life map, and force stops the auto stepper
function clearTable() {

    // Kill each cell
    const killCell = (r, c) => {

        // Convert from (r, c) to id
        const id = toId(r, c);

        // Clear life map
        lifeMap[r][c] = false;

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

/* SEED FUNCTIONALITY */

// Generates the seed of the current life map. Seed generation formula as of right now: base64(#rowsx#cols&(if starting with alive A.)#alive.#dead.#alive.#dead...)
function getCurrentSeed() {

    // Stringy size of seed
    const sizeString = TABLE_SIZE.r + 'x' + TABLE_SIZE.c;

    let lastCellAlive = lifeMap[0][0];

    // Distance between each cell alternating life state
    const cellLocations = lastCellAlive ? ['A'] : [];

    // Number of cells with same life status in a row
    let sameCount = 0;

    const eachCell = (r, c) => {
        // Life state of this cell
        const alive = lifeMap[r][c];

        // If the life state of this cell doesn't equal that of the last, push the count to the cell locations array and reset the count
        if (alive != lastCellAlive) {
            cellLocations.push(sameCount);
            sameCount = 0;
        }

        // Set the last cell life status to this cell's
        lastCellAlive = alive;

        // Increment count
        sameCount++;

        // If this is the last cell in the seed, and it is alive, push its count to the cell locations array
        if (r === TABLE_SIZE.r - 1 && c === TABLE_SIZE.c - 1 && alive) {
            cellLocations.push(sameCount);
        }
    }

    // Iterate through table
    iterateThroughTable(eachCell);

    // Compile raw seed string and return base64 encoded
    const rawSeedString = sizeString + '&' + cellLocations.join('.');
    // console.log(rawSeedString);
    return btoa(rawSeedString);
}

// Loads a seed as per the generation formula
function loadSeed(seed) {

    // Decode raw seed string from base64
    const rawSeedString = atob(seed);

    // Split raw seed string to size and location pieces
    const split = rawSeedString.split('&');

    // Split size strong and assign rows and columns constant
    const sizeString = split[0].split('x');

    const rows = sizeString[0];
    const cols = sizeString[1];

    // Disable loading of seed if it's grid size is larger than the current one
    if (rows > TABLE_SIZE.r || cols > TABLE_SIZE.c) {
        console.log("The seed that you're attempting to load is bigger than your grid size");
        return;
    }

    const cellLocations = split[1].split('.');

    // If first cell is alive, shift array so the alive indicator isn't included in positions
    let firstCellAlive = cellLocations[0] == 'A';
    if (firstCellAlive) {
        cellLocations.shift();
    }

    // Clear table to prepare for loading sead
    clearTable();

    // Number of cells with the same life status in a row
    let sameCount = 0;

    // Set alive section according to alive indicator
    let aliveSection = firstCellAlive;

    // Loop until iterated through whole table or exit early
    for (let r = 0; r < rows && cellLocations.length > 0; r++) {
        for (let c = 0; c < cols; c++) {
            // If this section of cells is alive, toggle them on (all cells are dead after clear)
            if (aliveSection) {
                toggleCell(toId(r, c));
                lifeMap[r][c] = !lifeMap[r][c]
            }
            // Increment count
            sameCount += 1;

            // If the count reaches the end of the section, shift that distance out of the array, reset the count, and flip the section
            if (sameCount == cellLocations[0]) {
                cellLocations.shift();
                sameCount = 0;
                aliveSection = !aliveSection;
            }
        }
    }
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
                if (lifeMap[r][c]) {
                    cell.classList.add('selectedAlive');
                } else {
                    cell.classList.add('selectedDead');
                }
            } else {
                cell.classList.remove('selectedAlive');
                cell.classList.remove('selectedDead');
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
                cell.classList.toggle('alive');
                cell.classList.toggle('dead');
                lifeMap[r][c] = !lifeMap[r][c];
            }
        })
    }

    // Remove the 'selected' class from every cell since selection is over
    iterateThroughTable((r, c) => {
        const cell = document.getElementById(toId(r, c));
        cell.classList.remove('selectedAlive');
        cell.classList.remove('selectedDead');
    })

    // No selection exists, null start point
    this.selectionStart = null;
});

/* SET UP WEB PAGE AND ADD INTERACTABILITY */

// Build DOM
document.getElementById('stepBtn').onclick = stepGame;
document.getElementById('autoStepBtn').onclick = autoStepHandler;
document.getElementById('clearBtn').onclick = clearTable;
document.getElementById('getSeedBtn').onclick = () => {
    document.getElementById("seedIO").value = getCurrentSeed();
};
document.getElementById('loadSeedBtn').onclick = () => {
    loadSeed(document.getElementById("seedIO").value);
};
document.getElementById('settingsBtn').onclick = () => {
    document.getElementById('cogImg').classList.toggle('rotated');
    document.getElementById('settingsContainer').classList.toggle('open');
}
buildTable();