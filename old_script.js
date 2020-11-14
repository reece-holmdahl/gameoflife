const cols = 40;
const rows = 20;
const H_PAGE_PERCENT = 90;
const V_PAGE_PERCENT = 100;

var cells = [];

// Builds table on page load
function build(table) {
  for (var r = 0; r < rows; r++) {
    let row = table.insertRow();
    for (var c = 0; c < cols; c++) {
      let cell = row.insertCell();

      // Build cell
      let id = r + "." + c;
      cell.setAttribute("id", id);
      cell.setAttribute("class", "dead");
      cell.onclick = function () {
        toggleCell(id);
      };
      // let text = document.createTextNode(id);
      // cell.appendChild(text);
      cells.push(cell);
    }
  }
}

function toggleCell(id) {
  let cell = document.getElementById(id);
  if (alive(id)) {
    cell.setAttribute("class", "dead");
  } else if (!alive(id)) {
    cell.setAttribute("class", "alive");
  }
}

function killCell(id) {
  let cell = document.getElementById(id);
  cell.setAttribute("class", "dead");
}

function clearScreen() {
  // console.log("hi");
  for (c of cells) {
    let id = c.getAttribute("id");
    killCell(id);
  }
}

// function birthCell(id) {
//   let cell = document.getElementById(id);
//   cell.setAttribute("class", "alive");
// }

function alive(id) {
  let cell = document.getElementById(id);
  if (cell.getAttribute("class") == "alive") {
    return true;
  } else if (cell.getAttribute("class") == "dead") {
    return false;
  } else {
    console.log("error! null cell class");
    return null;
  }
}

function stepGame() {
  var lifeMap = [];

  // Build life map
  for (var r = 0; r < rows; r++) {
    lifeMap[r] = [];
    for (var c = 0; c < cols; c++) {
      let id = r + "." + c;
      lifeMap[r][c] = alive(id);
    }
  }

  //Run game
  gameOfLife(lifeMap);
}

function gameOfLife(lifeMap) {
  // Iterate through all cells
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      // Cell id
      let id = r + "." + c;

      // Count alive neighbors
      let neighbors = countNeighbors(r, c, lifeMap, alive(id));

      if (neighbors > 0) {
        console.log(neighbors);
      }

      // Apply Conway's game of life rules
      if (alive(id) && (neighbors < 2 || neighbors > 3)) {
        toggleCell(id);
      } else if (!alive(id) && neighbors == 3) {
        toggleCell(id);
      }
    }
  }
}

function countNeighbors(r, c, lifeMap, alive) {
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

// Build table
let table = document.getElementById("bodyTable"); // id table body table
build(table);
