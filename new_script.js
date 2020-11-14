// Constants
const DEFAULT_SIZE_X = 5;
const DEFAULT_SIZE_Y = 3;
const DEFAULT_MS_PER_AUTO_STEP = 100;
const DEFAULT_DELAY_BEFORE_AUTO_MS = 1000;
const PAGE_WIDTH_PERCENT = 90.0;

// Cell array
var cellIds = [];

// Shorthand function for grabbing a cell via its ID
function getById(id) {
  return document.getElementById(id);
}

// Boolean: alive->true, dead->false
function alive(id) {
  return getById(id).getAttribute("class") == "alive";
}

// Kills a given cell
function kill(id) {
  getById(id).setAttribute("class", "dead");
}

// "Toggles" a given cell; alive->dead, dead->alive
function toggleCell(id) {
  let cell = getById(id);
  if (alive(id)) {
    kill(id);
  } else {
    cell.setAttribute("class", "alive");
  }
}

// Kills all cells; clears screen
function clearScreen() {
  for (id of cellIds) {
    kill(id);
  }
}

// Convert from row and column to r.c identifier
function toId(r, c) {
  return r + "." + c;
}

// Step the game one generation
function iterateGame() {
  let rows = getRows();
  let cols = getColumns();

  var lifeMap = [];

  // Build life map
  for (var r = 0; r < rows; r++) {
    lifeMap[r] = [];
    for (var c = 0; c < cols; c++) {
      let id = toId(r, c);

      // Fills the life map
      lifeMap[r][c] = alive(id);
    }
  }

  // Runs the game by its rules; removes clutter from the stepper method
  gameOfLife(lifeMap);
}

// Changed alive function to variable
function gameOfLife(lifeMap) {
  let rows = getRows();
  let cols = getColumns();

  // Iterate through all cells
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      // Cell id
      let id = toId(r, c);
      let isAlive = alive(id);

      // Count alive neighbors
      let neighbors = countNeighbors(r, c, lifeMap, isAlive);

      // Apply Conway's game of life rules
      if (isAlive && (neighbors < 2 || neighbors > 3)) {
        toggleCell(id);
      } else if (!isAlive && neighbors == 3) {
        toggleCell(id);
      }
    }
  }
}

// Counts the neighbors of a given cell according to the lifeMap
function countNeighbors(r, c, lifeMap, alive) {
  let rows = getRows();
  let cols = getColumns();

  // Bounds for neighbor calculations
  let bounds = [
    r > 0 ? r - 1 : 0,
    c > 0 ? c - 1 : 0,
    r < rows - 1 ? r + 1 : rows - 1,
    c < cols - 1 ? c + 1 : cols - 1,
  ];

  // If alive, decrease sum by 1 to not include self
  var sum = alive ? -1 : 0;

  // Iterates through range of neighbor bounds, increments sum if any cell is alive within range.
  for (var r = bounds[0]; r <= bounds[2]; r++) {
    for (var c = bounds[1]; c <= bounds[3]; c++) {
      sum += lifeMap[r][c] ? 1 : 0;
    }
  }

  return sum;
}

// Implement functionality to the step button
function handleStepButton() {
  // Get step button from DOM
  let stepButton = getById("stepButton");

  // Values that contain the timeout and interval timers
  var waitCall;
  var iterateCall;

  // If clicked once, iterate once
  stepButton.onclick = function () {
    iterateGame();
  };

  // Begin logic for auto stepping
  stepButton.onmousedown = function () {
    // Validates auto step settings for all stepping options
    validateAutoStepSettings();

    // Set timeout to anonymous function which sets interval to specified number
    waitCall = setTimeout(function () {
      iterateCall = setInterval(iterateGame, getMsPerAutoStep());
    }, getAutoStepDelay());
  };

  // On mouse up, clear timeout and clear interval for auto stepping
  stepButton.onmouseup = function () {
    clearTimeout(waitCall);
    clearInterval(iterateCall);
  };
}

// Validate grid settings specifically
function validateGridSettings() {
  // Value and placeholder for vertical grid size
  vGridSize.setAttribute("value", DEFAULT_SIZE_Y);
  vGridSize.setAttribute("placeholder", DEFAULT_SIZE_Y);

  // ^^
  hGridSize.setAttribute("value", DEFAULT_SIZE_X);
  hGridSize.setAttribute("placeholder", DEFAULT_SIZE_X);

  // Reset numbers if they aren't valid integers
  if (
    getRows() < 1 ||
    getColumns < 1 ||
    !Number.isInteger(getRows()) ||
    !Number.isInteger(getColumns())
  ) {
    getById("sizeAdjust").reset();
  }
}

// Validate auto step settings specifically
function validateAutoStepSettings() {
  // Value and placeholder for ms per auto step
  msPerAutoStep.setAttribute("value", DEFAULT_MS_PER_AUTO_STEP);
  msPerAutoStep.setAttribute("placeholder", DEFAULT_MS_PER_AUTO_STEP);

  // ^^
  autoStepDelay.setAttribute("value", DEFAULT_DELAY_BEFORE_AUTO_MS);
  autoStepDelay.setAttribute("placeholder", DEFAULT_DELAY_BEFORE_AUTO_MS);

  // Reset numbers if they aren't valid integers
  if (
    getMsPerAutoStep() < 1 ||
    getAutoStepDelay() < 1 ||
    !Number.isInteger(getMsPerAutoStep()) ||
    !Number.isInteger(getAutoStepDelay())
  ) {
    console.log("here");
    getById("autoStep").reset();
  }
}

// Implement default settings
function validateAllSettings() {
  validateGridSettings();
  validateAutoStepSettings();
}

// Implement functionality to the settings button
function handleSettingsButton() {
  // Get settings button from DOM
  let settingsButton = getById("settingsButton");

  // Onclick function to toggle the settings window and blur background
  settingsButton.onclick = function () {
    // Handle settings div opening and background blur
    getById("settingsWrapper").classList.toggle("closed");
    getById("settingsWrapper").classList.toggle("open");
    getById("pageWrapper").classList.toggle("blur");

    // Handle weird text appearing stuff
    let sizeAdjust = getById("sizeAdjust");
    let hidden = sizeAdjust.classList.contains("hide");
    let hideTimeout = 900;
    setTimeout(
      function () {
        sizeAdjust.classList.toggle("hide");
        getById("autoStep").classList.toggle("hide");
        getById("seedOptions").classList.toggle("hide");
      },
      hidden ? hideTimeout : 50
    );
  };
}

// Implements functionality to the rebuild button in the settings pane
function handleRebuildTableButton(table) {
  getById("rebuildTable").onclick = function () {
    // Delete and rebuild the entire table
    killTable(table);
    buildTable(table);
  };
}

// Resets table dimensions and rebuilds the table
function resetGame() {
  getById("sizeAdjust").reset();
  getById("autoStep").reset();
  getById("rebuildTable").click();
}

// Getter for the number of rows; raw size is unneeded
function getRows() {
  return vGridSize.value * 8;
}

// ^^, columns
function getColumns() {
  return hGridSize.value * 8;
}

// Getter for milliseconds per auto step
function getMsPerAutoStep() {
  return parseInt(msPerAutoStep.value);
}

// Getter for delay before auto stepping begins
function getAutoStepDelay() {
  return parseInt(autoStepDelay.value);
}

// Function to build the HTML table
function buildTable(table) {
  // Make sure grid settings don't contain anything other than numbers...
  validateGridSettings();

  // Resize cells based on (possibly) new numbers
  document.documentElement.style.setProperty(
    "--cell-size",
    calcGridSize() + "vw"
  );

  // Grab number of rows and columns for loops
  let rows = getRows();
  let cols = getColumns();

  // Iterate through loop with desired size to generate game table
  for (var r = 0; r < rows; r++) {
    let row = table.insertRow();
    for (var c = 0; c < cols; c++) {
      // Pre-object stuff
      let id = toId(r, c);
      let cell = row.insertCell();

      // Initialize cell
      cell.setAttribute("id", id);
      cell.setAttribute("class", "dead");
      cell.onclick = function () {
        toggleCell(id);
      };

      // Add id to array
      cellIds.push(id);
    }
  }
}

function killTable(table) {
  while (table.hasChildNodes()) {
    table.removeChild(table.firstChild);
  }
}

/*
  Still sort of WIP... does pretty good but isn't great with window resizes (I believe do to cell borders not respecting resizes appropriately;
  will receive touch ups when I get into response design)
*/
function calcGridSize() {
  // Grab rows and columns
  let vCells = getRows();
  let hCells = getColumns();

  // Calculate "best guess" ratios for cell size
  let hCellRatio = PAGE_WIDTH_PERCENT / hCells;
  let vCellRatio =
    (90 * document.documentElement.clientHeight) /
    document.documentElement.clientWidth /
    vCells;

  // Grab minimum cell size so each axis fits on page.. again, best as possible
  let cellSize = Math.min(vCellRatio, hCellRatio);
  return cellSize;
}

// Settings and inputs from DOM
let vGridSize = getById("verticalSize");
let hGridSize = getById("horizontalSize");
let msPerAutoStep = getById("msPerAutoStep");
let autoStepDelay = getById("delayBeforeAutoStep");
validateAllSettings();

// Build HTML page and implement functionality
let table = getById("gameTable");
buildTable(table);
handleStepButton();
handleSettingsButton();
handleRebuildTableButton(table);

// Open setting pane on start TEMP DEV
// getById("settingsButton").click();
