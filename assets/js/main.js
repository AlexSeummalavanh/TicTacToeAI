//SCOREKEEPING VARIABLES
let humanWins = 0;
let aiWins = 0;
let draws = 0;
//TIMER VARIABLE STORAGE
let moveTimes = [];

let depthCap = 3; //UPDATE THIS NUMBER TO CHANGE THE DEPTH OF THE AI SEARCH

let boardSize = 3; // Default board size
let currentPlayer = 'X'; //X and start first and AI will play as O
let gameBoard = []; // 2D array to store the game board state

let gameMode = 'humanVsAi'; 

function initializeGame() {

    gameBoard = [];
    //reset game state and UI
    document.getElementById('timer').innerHTML = '';
    moveTimes = [];
    boardSize = parseInt(document.getElementById('boardSize').value);
    currentPlayer = 'X';
    for (let i = 0; i < boardSize; i++) {
        gameBoard[i] = [];
        for(let j = 0; j < boardSize; j++) {
            gameBoard[i][j] = null;
        }
    }
    updateStats();
    drawBoard();
}

function playAI1() {
    let startTime = Date.now(); // Add timing
    const bestMove = findBestMove1(gameBoard);
    if (bestMove) {
        gameBoard[bestMove.i][bestMove.j] = currentPlayer;
        drawBoard();
        let endTime = Date.now();
        let time = (endTime - startTime) / 1000;
        moveTimes.push(time);  // Add this for consistency

        updateStats();

        setTimeout(function () {
            if (checkWinner(gameBoard) === 'X') {
                alert(`AI1 wins!`);
                aiWins++;
                updateStats();
                initializeGame();
            } else if (isBoardFull(gameBoard)) {
                alert('Draw!');
                draws++;
                updateStats();
                initializeGame();
            }
        }, 100);
    }

    // Switch turn
    currentPlayer = (currentPlayer === 'O') ? 'X' : 'O';

    if (!checkWinner(gameBoard) && !isBoardFull(gameBoard)) {
        setTimeout(playAI, 100);
    }
}

function findBestMove1(board) {
  //FINDS THE BEST MOVE FOR THE AI TO MAKE
  let bestScore = -Infinity;
  let move;
  let alpha = -Infinity;
  let beta = Infinity;

  for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
          if (board[i][j] === null) {
            //simulate the move to see if it would be the best move
            board[i][j] = 'X';
            let score = maximize(board,0, alpha, beta);
            board[i][j] = null;
              if (score > bestScore) {
                  bestScore = score;
                //   console.log("BEST SCORE: " + bestScore)
                //   console.log("BEST MOVE: " + i + " " + j)
                  move = { i, j };
                  alpha = Math.max(alpha, bestScore); //update alpha
                //   console.log("NEW ALPHA: " + alpha);
              }
          }
      }
  }
  return move;
}

function drawBoard() {
  //update the UI to reflect the game board state
    let table = document.getElementById('gameBoard');
    table.innerHTML = '';

    for (let i = 0; i < boardSize; i++) {
        let row = table.insertRow();
        for (let j = 0; j < boardSize; j++) {
            let cell = row.insertCell();
            cell.id = `cell-${i}-${j}`;
            if (gameMode === "humanVsAi"){
                cell.onclick = () => handleCellClick(i, j);
            }
            cell.textContent = gameBoard[i][j];
        }
    }
}


function handleCellClick(row, col) {
    //if there already exists a marker in that cell or if there is a winner, do nothing
    if (gameBoard[row][col]!==null || checkWinner(gameBoard)) {
        return;
    }

    gameBoard[row][col] = currentPlayer;
    // console.log(gameBoard)

    drawBoard();

    // Use setTimeout to allow the UI to update before showing the alert
    setTimeout(function() {
      if (checkWinner(gameBoard) === 'X') {
          alert(`Human wins!`);
          humanWins++;
          updateStats();
          initializeGame();
      } else if (isBoardFull(gameBoard)) {
          alert('Draw!');
          draws++;
          updateStats();
          initializeGame();
      }
    }, 100); //set delay 

    //next turn
    if (currentPlayer === 'X') {
      currentPlayer = 'O';
    } else {
      currentPlayer = 'X';
    }

    //AI's turn
    setTimeout(function() { 
        if (currentPlayer === 'O') {
            playAI();
        }
    },101);

    // console.log(gameBoard)
}

function playAI() {
    //Time the AI's move
    let startTime = Date.now();
    const bestMove = findBestMove(gameBoard);
    if (bestMove) {
        gameBoard[bestMove.i][bestMove.j] = currentPlayer;
        drawBoard();
    let endTime = Date.now();
    time = (endTime - startTime)/1000;
    moveTimes.push(time);

    //Update time taken for move UI
    updateStats();

    // Use setTimeout to allow the UI to update before showing the alert
    setTimeout(function() {
        if (checkWinner(gameBoard) === 'O') {
          alert(`AI wins!`);
          aiWins++;
          updateStats();
          initializeGame();
      } else if (isBoardFull(gameBoard)) {
          alert('Draw!');
          draws++;
          updateStats();
          initializeGame();
      }
     }, 10); // 10 milliseconds delay

    }

    //switch turn
    if (currentPlayer === 'O') {
      currentPlayer = 'X';
    } else {
      currentPlayer = 'O';
    }
    if(gameMode !== "humanVsAi"){
        if (!checkWinner(gameBoard) && !isBoardFull(gameBoard)) {
            setTimeout(playAI1, 100);
        }
    }
    // console.log(JSON.parse(JSON.stringify(gameBoard)));
}

function updateStats() {
  //update game STATS UI
  humanWinsElement = document.getElementById('humanWs');
  aiWinsElement = document.getElementById('aiWs');
  drawsElement = document.getElementById('drawCount');
  document.getElementById('timer').innerHTML = '';
  if (gameMode === "humanVsAi"){
  humanWinsElement.textContent = "Human:" + humanWins;
  }
  else{
    humanWinsElement.textContent = "Ai1:" + humanWins;
  }
  if(gameMode === "humanVsAi"){
    aiWinsElement.textContent = "Ai:" + aiWins;
  }
  else{
    aiWinsElement.textContent = "Ai2:" + aiWins;
  }
  drawsElement.textContent = "Draws:" + draws;

  for (let i = 0; i < moveTimes.length; i++) {
    t = document.createElement('p');
    t.id = "timeTaken"
    t.textContent = "Move " + (i+1) + ": " + moveTimes[i] + "s";
    document.getElementById('timer').appendChild(t);
  }
}

//Ai is the maximizer
function maximize(board, depth,alpha, beta) {
    const winner = checkWinner(board);
    curBest = -Infinity;
    //if ai wins, return a high score
    if (winner !== null) {
        if (winner === 'O') {
            return 10 - depth;
        }
        else if (winner === 'X') {
            return -10 + depth;
        }
        else{
          return 0;
        }  }
  
    if (depth ===depthCap){
      return 0;
    }

    const values = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === null) {
                board[i][j] = 'O';
                const score = minimize(board, depth+1,alpha, beta);
                board[i][j] = null;
                values.push(score);
                curBest = Math.max(curBest, score)
                if (curBest > beta){
                    return score
                }
                alpha = Math.max(alpha, curBest);
            }
        }
    }

    const maximizingScore = Math.max(...values);
    // console.log(maximizingScore)
    return maximizingScore;
}

//Human is the minimizer in this case
function minimize(board, depth , alpha, beta) {
    let curBest = Infinity;
    const winner = checkWinner(board);    
    //If ai wins, return a high score
    if (winner !== null) {
        if (winner === 'O') {
            return 10 - depth;
        }
        else if (winner === 'X') {
            return -10 + depth;
        }
        else{
          return 0;
        }  }
  
    if (depth ===depthCap){
      return 0;
    }

    const values = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === null) {
                board[i][j] = 'X';
                const score = maximize(board, depth + 1,alpha, beta);
                board[i][j] = null;
                values.push(score);
                curBest = Math.min(curBest, score)
                if (curBest < alpha){
                    return score
                }
                beta = Math.min(beta, curBest);
            }
        }
    }
    const minimizingScore = Math.min(...values);
    // console.log(minimizingScore)
    return minimizingScore;
}


function findBestMove(board) {
  //FINDS THE BEST MOVE FOR THE AI TO MAKE
  let bestScore = -Infinity;
  let move;
  let alpha = -Infinity;
  let beta = Infinity;

  for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
          if (board[i][j] === null) {
            //simulate the move to see if it would be the best move
            board[i][j] = 'O';
            let score = minimize(board,0, alpha, beta);
            board[i][j] = null;
              if (score > bestScore) {
                  bestScore = score;
                //   console.log("BEST SCORE: " + bestScore)
                //   console.log("BEST MOVE: " + i + " " + j)
                  move = { i, j };
                  alpha = Math.max(alpha, bestScore); //update alpha
                //   console.log("NEW ALPHA: " + alpha);
              }
          }
      }
  }
  return move;
}

function checkWinner(board) {
  // Check rows
  for (let i = 0; i < boardSize; i++) {
      if (board[i].every(cell => cell === 'X')) {
          return 'X';
      }
      if (board[i].every(cell => cell === 'O')) {
          return 'O';
      }
  }

  // Check columns
  for (let i = 0; i < boardSize; i++) {
      let col = board.map(row => row[i]);
      if (col.every(cell => cell === 'X')) {
          return 'X';
      }
      if (col.every(cell => cell === 'O')) {
          return 'O';
      }
  }

  // Check right diagonal (\)
  const rightDiagonal = [];
  for (let i = 0; i < boardSize; i++) {
      rightDiagonal.push(board[i][i]);
  }

  if (rightDiagonal.every(cell => cell === 'X')) {
      return 'X';
  }
  if (rightDiagonal.every(cell => cell === 'O')) {
      return 'O';
  }

  //check left diagonal (/)
  const leftDiagonal = [];
  for(let i=0;i<boardSize;i++){
    leftDiagonal.push(board[i][boardSize-1-i])
  }
  if(leftDiagonal.every(cell => cell === 'X')){
    return 'X';
  }
  if(leftDiagonal.every(cell => cell === 'O')){
    return 'O';
  } 
  return null;
}

// Check if the board is full
function isBoardFull(board) {
    return board.every(row => row.every(cell => cell !== null));
}
