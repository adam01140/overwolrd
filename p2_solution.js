


/* exported generateGrid, drawGrid */
/* global placeTile, random, floor */

// Lookup table for tile offsets based on context
const lookup = [
  [0, 4], // Code 0 (0000): Background dirt tile (no walls nearby)
  [16, 5], // Code 1 (0001): Wall tile (wall to the north)
  [3, 3], // Code 2 (0010): Wall tile (wall to the south)
  [17, 24], // Code 3 (0011): Wall tile (walls to the north and south, use vertical piece)
  [18, 24], // Code 4 (0100): Wall tile (wall to the east)
  [16, 5], // Code 5 (0101): Wall Corner Top Right
  [16, 5], // Code 6 (0110): Wall Corner Top Left
  [18, 24], // Code 15 (1111): Background dungeon tile (surrounded by walls)
  [10, 16], //flower
];

function gridCheck(grid, i, j, target) {
  // Check bounds and then check for the target
  return (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length && grid[i][j] === target);
}

function gridCode(grid, i, j, target) {
  // Get the binary code based on the presence of target in the neighboring cells
  const north = gridCheck(grid, i-1, j, target) ? 1 : 0;
  const south = gridCheck(grid, i+1, j, target) ? 1 : 0;
  const east = gridCheck(grid, i, j+1, target) ? 1 : 0;
  const west = gridCheck(grid, i, j-1, target) ? 1 : 0;
  return (north << 0) + (south << 1) + (east << 2) + (west << 3);
}

function drawContext(grid, i, j, target, ti, tj) {
  const code = gridCode(grid, i, j, target);
  if (target !== '_') {
    // Adjust the code for wall tiles and corners
    let adjustedCode = code;
    if (target === 'b') {
      // For walls, treat all cases of walls to the north, south, east, or west the same
      adjustedCode = 1;
      if (gridCheck(grid, i-1, j, '_') && gridCheck(grid, i, j+1, '_')) {
        adjustedCode = 5; // Wall Corner Top Right
      } else if (gridCheck(grid, i-1, j, '_') && gridCheck(grid, i, j-1, '_')) {
        adjustedCode = 6; // Wall Corner Top Left
      }
      // Add more conditions here for other types of wall configurations if needed
    }
    const [tiOffset, tjOffset] = lookup[adjustedCode];
    placeTile(i, j, ti + tiOffset, tj + tjOffset);
  } else {
    // Background tiles
    const [tiOffset, tjOffset] = lookup[code];
    placeTile(i, j, tiOffset, tjOffset);
  }
}



function generateGrid(numCols, numRows) {
  let grid = [];
    for (let i = 0; i < numRows; i++) {
        let row = [];
        for (let j = 0; j < numCols; j++) {
            // Randomly decide to place a flower tile
            if (random() < 0.1) {  // 10% chance to place a flower
                row.push('f');  // Assuming 'f' is the code for flower tiles
            } else {
                row.push("_");  // Otherwise, place a background dirt tile
            }
        }
        grid.push(row);
    }

    
  

  let centers = [];
  for (let i = 0; i < 5; i++) { // Assuming you want 5 rooms
      centers.push(createRoom());
  }

  connectRooms(centers);

  return grid;

  
  // Helper function to check if the space for a room is clear
  function isSpaceClear(startX, startY, roomWidth, roomHeight, padding) {
    // Check the room space plus an additional padding
    for (let i = startY - padding; i < startY + roomHeight + padding; i++) {
      for (let j = startX - padding; j < startX + roomWidth + padding; j++) {
        if (i < 0 || j < 0 || i >= numRows || j >= numCols) {
          // If the space is outside grid bounds, it's not clear
          return false;
        } else if (grid[i][j] === 'b' || grid[i][j] === 'i') {
          // If the space is occupied, it's not clear
          return false;
        }
      }
    }
    return true;
  }

  function createRoom() {
    let roomPlaced = false;
    let center = null;
    while (!roomPlaced) {
        const roomWidth = floor(random(5, 11));
        const roomHeight = floor(random(7, 15));
        const padding = 4;
        const startX = floor(random(padding, numCols - roomWidth - padding));
        const startY = floor(random(padding, numRows - roomHeight - padding));

        if (isSpaceClear(startX, startY, roomWidth, roomHeight, padding - 1)) {
            for (let i = startY; i < startY + roomHeight; i++) {
                for (let j = startX; j < startX + roomWidth; j++) {
                    const isBorder = i === startY || i === startY + roomHeight - 1 || j === startX || j === startX + roomWidth - 1;
                    grid[i][j] = isBorder ? 'b' : 'i';
                }
            }
            center = [startX + Math.floor(roomWidth / 2), startY + Math.floor(roomHeight / 2)];
            roomPlaced = true;
        }
    }
    return center;
}

function connectRooms(centers) {
  for (let i = 0; i < centers.length - 1; i++) {
      let start = centers[i];
      let end = centers[i + 1];
      // Connect horizontally first, then vertically
      for (let x = Math.min(start[0], end[0]); x <= Math.max(start[0], end[0]); x++) {
          if (grid[start[1]][x] !== 'i') {
              //grid[start[1]][x] = 'b'; // Use wall tiles for hallways
          }
      }
      for (let y = Math.min(start[1], end[1]); y <= Math.max(start[1], end[1]); y++) {
          if (grid[y][start[0]] !== 'i') {
              //grid[y][start[0]] = 'b'; // Use wall tiles for hallways
          }
      }
  }
}
  // Create two non-overlapping rooms
  createRoom();
  createRoom();
  createRoom();
  createRoom();
  createRoom();
  createRoom();
  createRoom();
  createRoom();
  
  return grid;
}




function drawGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == '_') {
        // Draw background dirt
        placeTile(i, j, 0 + (floor(random(4))), 0);
      } else if (grid[i][j] == 'b') {
        // Draw wall tiles
        drawContext(grid, i, j, 'b', 0, 0);
        
      } else if (grid[i][j] == 'i') {
        // Draw inside dungeon tiles
        placeTile(i, j, Math.floor(Math.random() * 3)+ 0, 13);
      }
      else if (grid[i][j] == 'f') {
        // Draw inside dungeon tiles
        placeTile(i, j, 17, Math.floor(Math.random() * 2)+ 1);
      }
    }
  }
}
