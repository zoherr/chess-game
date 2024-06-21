const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const moveSound = document.getElementById("moveSound");
const invalidMoveSound = document.getElementById("invalidMoveSound");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let upperBox = document.querySelector("#box1");
let lowerBox = document.querySelector("#box2");
let upperImg = document.querySelector("#img1");
let lowerImg = document.querySelector("#img2");

let timerSeconds = 600; // 10 minutes = 600 seconds
let timerInterval = null;
const rotatingElement = document.getElementById('rotatingElement');
const rotatingElement2 = document.getElementById('rotatingElement2');

let currentRotation = 0;

setInterval(() => {
  currentRotation += 90; // Subtract 180 degrees
  rotatingElement.style.transform = `rotate(${currentRotation}deg)`;
  rotatingElement2.style.transform = `rotate(${currentRotation}deg)`;

}, 1000);

function startTimer() {
    clearInterval(timerInterval); // Clear any existing interval to avoid multiple timers
    timerInterval = setInterval(updateTimer, 1000); // Update every second
}

function updateTimer() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // document.querySelector("#time1").textContent = formattedTime;
    document.querySelector("#time2").textContent = formattedTime;

    if (timerSeconds === 0) {
        clearInterval(timerInterval);
        // Optionally, you can trigger actions when time runs out
        // For example, end the game or take some action
        alert("Time's up!");
    } else {
        timerSeconds--;
    }
}

// -------------
function displayCurrentTime() {
    const noww = new Date();
    const hourrs = noww.getHours().toString().padStart(2, '0');
    const minutees = noww.getMinutes().toString().padStart(2, '0');
    
    const currentTimes = `${hourrs}:${minutees}`;
    document.querySelector("#time1").innerHTML = currentTimes;
  }
  
  // Display the time every second
  setInterval(displayCurrentTime, 1000);
// -------------
function renderBoard() {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((raw, rowIndex) => {
        raw.forEach((square, squareindex) => {

            const squareElement = document.createElement("div");

            squareElement.classList.add("square",
                (rowIndex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSource);
                    
                }
            });
            boardElement.appendChild(squareElement);
        });
    });
    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
        upperBox.style.cssText = "color: #f0f0f0; background-color:#212120";
        lowerBox.style.cssText = "color: #f0f0f0; background-color:#212120";
        upperImg.src = "https://www.chess.com/bundles/web/images/white_400.png";
        lowerImg.src = "https://www.chess.com/bundles/web/images/white_400.png";
    } else {
        boardElement.classList.remove("flipped");
    }
    checkTurn();
    checkTurnSecond();
}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♟︎",
        R: "♜",
        N: "♞",
        B: "♝",
        Q: "♛",
        K: "♚",
    };
    return unicodePieces[piece.type] || " ";
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
    spectatorRoleManage()
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("invalidMove", (move) => {
    // alert("Invalid Move!");
    invalidMoveSound.currentTime = 0; // Reset audio to start (in case it's already playing)

    invalidMoveSound.play()
    // Optionally, you can reload the board state to reflect the correct position
    socket.emit("requestBoardState");
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

function checkTurn() {
    const turn = chess.turn();
    if (playerRole === 'w' && turn === 'w') {
        startTimer();
        moveSound.currentTime = 0; // Reset audio to start (in case it's already playing)
        moveSound.play();
        document.querySelector(".time53").style.display = "block";
    } else if (playerRole === 'b' && turn === 'b') {
        startTimer();
        moveSound.currentTime = 0; // Reset audio to start (in case it's already playing)
        moveSound.play();
        document.querySelector(".time53").style.display = "block";
    } else {
        document.querySelector(".time53").style.display = "none";
    }
}

function checkTurnSecond() {
    const turn = chess.turn();
    if (playerRole === 'w' && turn !== 'w') {
        moveSound.currentTime = 0; // Reset audio to start (in case it's already playing)
        moveSound.play();
        clearInterval(timerInterval);
        document.querySelector(".time52").style.display = "block";
        
    } else if (playerRole === 'b' && turn !== 'b') {
        clearInterval(timerInterval);
        moveSound.currentTime = 0; // Reset audio to start (in case it's already playing)
        moveSound.play();
        document.querySelector(".time52").style.display = "block";
    } else {
        document.querySelector(".time52").style.display = "none";
    }
}

function spectatorRoleManage(){
    if (playerRole !== 'w' && playerRole !== 'b') {
        upperBox.style.display = "none";
        lowerBox.style.display = "none";

        
    }
}

renderBoard();
