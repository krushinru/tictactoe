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
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // Check if the cell is empty
            if (grid[i][j] === null) {
                grid[i][j] = player; // Make the move
                let score = minimax(grid, false, player); // Call minimax
                grid[i][j] = null; // Undo the move

                if (score > bestScore) { // Choose the higher score move
                    bestScore = score;
                    move = { i, j };
                }
            }
        }
    }
    return move;
}

function minimax(grid, isMaximizing, player) {
    const opponent = player === 'o' ? '×' : 'o';
    const winner = checkWinner(grid);
    
    if (winner !== null) {
        return scores[winner]; // Return the score from the scores object
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === null) {
                    grid[i][j] = player;
                    let score = minimax(grid, false, player);
                    grid[i][j] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === null) {
                    grid[i][j] = opponent;
                    let score = minimax(grid, true, player);
                    grid[i][j] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}

function checkWinner(grid) {
    // Define possible winning combinations
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        const first = grid[Math.floor(a / 3)][a % 3];
        const second = grid[Math.floor(b / 3)][b % 3];
        const third = grid[Math.floor(c / 3)][c % 3];

        // Check if the cells are non-null and match
        if (first !== null && first === second && first === third) {
            return first;  // Return the winner ('o' or '×')
        }
    }

    // Check for a draw by verifying there are no empty cells left
    let isDraw = true;
    for (let row of grid) {
        for (let cell of row) {
            if (cell === null) {
                isDraw = false;
                break;
            }
        }
        if (!isDraw) break;
    }

    if (isDraw) {
        return 'draw';  // Return 'draw' if the board is full and there's no winner
    }

    return null;  // Return null if the game should continue
}


const scores = { 'o': 1, '×': -1, 'draw': 0 }; // Adjust scores as per the perspective (AI is 'o')



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