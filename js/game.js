let grid, moveOrder, gameMode, currentPlayer, isComputerThinking = false;;

function initGame(mode) {
    grid = Array.from({ length: 3 }, () => Array(3).fill(null));
    moveOrder = [];
    gameMode = mode;
    currentPlayer = '×'; // 'X' starts first
    updateBoard();
}

const board = document.getElementById('gameboard');

function updateBoard() {
    document.getElementById('victoryMessage').style.display = 'none';
    board.innerHTML = '';
    grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellElem = document.createElement('div');
            cellElem.className = 'cell ' + (cell || '');
            cellElem.textContent = cell || '';
            if (cell && moveOrder.slice(-6, -5).includes(`${i}${j}`)) cellElem.classList.add('fade');
            cellElem.addEventListener('click', () => makeMove(i, j));
            board.appendChild(cellElem);
        });
    });
}

function makeMove(i, j) {
    if (grid[i][j] || isComputerThinking) return;
    grid[i][j] = currentPlayer;
    moveOrder.push(`${i}${j}`);
    if (moveOrder.length > 6) {
        const [oldI, oldJ] = moveOrder.shift().split('').map(Number);
        grid[oldI][oldJ] = null;
    }
    updateBoard();
    checkWin(currentPlayer);
    togglePlayer();
}

function togglePlayer() {
    currentPlayer = currentPlayer === '×' ? 'o' : '×';
    if (gameMode === 'pvc' && currentPlayer === 'o') {
        isComputerThinking = true;
        setTimeout(computerMove, Math.random() * 1000 + 500); // Simulate thinking delay
    }
}

function findBestMove(grid, player) {
    const opponent = player === 'o' ? '×' : 'o';
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function isWinning(grid, player, [a, b, c]) {
        return (
            (grid[Math.floor(a/3)][a%3] === player && grid[Math.floor(b/3)][b%3] === player && grid[Math.floor(c/3)][c%3] === null) ||
            (grid[Math.floor(a/3)][a%3] === player && grid[Math.floor(c/3)][c%3] === player && grid[Math.floor(b/3)][b%3] === null) ||
            (grid[Math.floor(b/3)][b%3] === player && grid[Math.floor(c/3)][c%3] === player && grid[Math.floor(a/3)][a%3] === null)
        );
    }

    // Try to win or block the opponent from winning
    for (let condition of winConditions) {
        for (let playerCheck of [player, opponent]) {
            for (let idx of condition) {
                if (grid[Math.floor(idx/3)][idx%3] === null) {
                    const tempGrid = grid.map(row => row.slice()); // Clone grid
                    tempGrid[Math.floor(idx/3)][idx%3] = playerCheck;
                    if (isWinning(tempGrid, playerCheck, condition)) {
                        return { i: Math.floor(idx/3), j: idx%3 };
                    }
                }
            }
        }
    }

    // Play the center
    if (grid[1][1] === null) {
        return { i: 1, j: 1 };
    }

    // Play an empty corner
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(idx => grid[Math.floor(idx/3)][idx%3] === null);
    if (emptyCorners.length > 0) {
        const move = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        return { i: Math.floor(move/3), j: move%3 };
    }

    // Play an empty side
    const sides = [1, 3, 5, 7];
    const emptySides = sides.filter(idx => grid[Math.floor(idx/3)][idx%3] === null);
    if (emptySides.length > 0) {
        const move = emptySides[Math.floor(Math.random() * emptySides.length)];
        return { i: Math.floor(move/3), j: move%3 };
    }

    // If all else fails, pick any empty space (shouldn't really get here in a normal game)
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] === null) {
                return { i, j };
            }
        }
    }

    return null; // No move found
}


function computerMove() {
    let move = findBestMove(grid, 'o');
    if (!move) {
        move = { i: Math.floor(Math.random() * 3), j: Math.floor(Math.random() * 3) };
        while (grid[move.i][move.j]) {
            move.i = Math.floor(Math.random() * 3);
            move.j = Math.floor(Math.random() * 3);
        }
    }
    isComputerThinking = false;
    makeMove(move.i, move.j);
}

function checkWin(player) {
    const lines = [
        ...grid,
        ...Array.from({ length: 3 }, (_, i) => grid.map(row => row[i])),
        [grid[0][0], grid[1][1], grid[2][2]],
        [grid[0][2], grid[1][1], grid[2][0]]
    ];
    const winningLine = lines.find(line => line.every(cell => cell === player));
    if (winningLine) {
        showVictory(player, winningLine);
        grid = Array.from({ length: 3 }, () => Array(3).fill(null));
        moveOrder = [];
    }
}

function showVictory(player) {
    const messageBox = document.getElementById('victoryMessage');
    messageBox.textContent = `${player} wins!`;
    messageBox.style.display = 'block';
}

initGame('pvc'); // Default to player vs player on load