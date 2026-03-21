// ChessTutor - Enhanced Chess Learning Platform
// Main JavaScript file with improved chess logic and UI interactions

// Initialize when document is ready
$(document).ready(function() {
    // Update footer year
    var currentYear = new Date().getFullYear();
    $('.footer-year').text(currentYear);
    
    // Initialize smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 600);
    });
    
    // Add fade-in animation to elements as they scroll into view
    addScrollAnimations();
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add active state to current nav link
    highlightCurrentNavLink();
});

// Chess piece movement validation with enhanced logic
class ChessMoveValidator {
    constructor() {
        this.boardSize = 8;
    }
    
    // Validate if a move is within board boundaries
    isValidSquare(square) {
        const file = square.charCodeAt(0) - 97; // 'a' = 0
        const rank = parseInt(square[1]) - 1;    // '1' = 0
        return file >= 0 && file < this.boardSize && rank >= 0 && rank < this.boardSize;
    }
    
    // Calculate distance between two squares
    getSquareDistance(source, target) {
        const fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
        const rankDiff = Math.abs(parseInt(source[1]) - parseInt(target[1]));
        return { fileDiff, rankDiff };
    }
    
    // Check if path is clear for sliding pieces
    isPathClear(source, target, getPieceAt) {
        const { fileDiff, rankDiff } = this.getSquareDistance(source, target);
        const direction = {
            file: (target.charCodeAt(0) - source.charCodeAt(0)) / (fileDiff || 1),
            rank: (parseInt(target[1]) - parseInt(source[1])) / (rankDiff || 1)
        };
        
        let currentFile = source.charCodeAt(0);
        let currentRank = parseInt(source[1]);
        
        // Move step by step towards target
        while (true) {
            currentFile += direction.file;
            currentRank += direction.rank;
            
            const currentSquare = String.fromCharCode(currentFile) + currentRank;
            if (currentSquare === target) break;
            
            if (getPieceAt && getPieceAt(currentSquare)) {
                return false; // Path is blocked
            }
        }
        
        return true;
    }
    
    // King move validation
    isValidKingMove(source, target, piece, boardState) {
        if (!this.isValidSquare(source) || !this.isValidSquare(target)) return false;
        
        const { fileDiff, rankDiff } = this.getSquareDistance(source, target);
        if (fileDiff === 0 && rankDiff === 0) return false;
        
        // Basic king move (one square in any direction)
        if (fileDiff <= 1 && rankDiff <= 1) {
            // Check if target square is not occupied by own piece
            const targetPiece = boardState && boardState[target];
            if (targetPiece && this.isSameColor(piece, targetPiece)) {
                return false;
            }
            return true;
        }
        
        return false;
    }
    
    // Rook move validation
    isValidRookMove(source, target, piece, boardState) {
        if (!this.isValidSquare(source) || !this.isValidSquare(target)) return false;
        
        const { fileDiff, rankDiff } = this.getSquareDistance(source, target);
        const isStraightLine = fileDiff === 0 || rankDiff === 0;
        
        if (!isStraightLine || (fileDiff === 0 && rankDiff === 0)) return false;
        
        // Check if path is clear
        if (boardState && !this.isPathClear(source, target, (sq) => boardState[sq])) {
            return false;
        }
        
        // Check if target square is not occupied by own piece
        const targetPiece = boardState && boardState[target];
        if (targetPiece && this.isSameColor(piece, targetPiece)) {
            return false;
        }
        
        return true;
    }
    
    // Bishop move validation
    isValidBishopMove(source, target, piece, boardState) {
        if (!this.isValidSquare(source) || !this.isValidSquare(target)) return false;
        
        const { fileDiff, rankDiff } = this.getSquareDistance(source, target);
        
        if (fileDiff !== rankDiff || fileDiff === 0) return false;
        
        // Check if path is clear
        if (boardState && !this.isPathClear(source, target, (sq) => boardState[sq])) {
            return false;
        }
        
        // Check if target square is not occupied by own piece
        const targetPiece = boardState && boardState[target];
        if (targetPiece && this.isSameColor(piece, targetPiece)) {
            return false;
        }
        
        return true;
    }
    
    // Queen move validation (combination of rook and bishop)
    isValidQueenMove(source, target, piece, boardState) {
        return this.isValidRookMove(source, target, piece, boardState) || 
               this.isValidBishopMove(source, target, piece, boardState);
    }
    
    // Knight move validation
    isValidKnightMove(source, target, piece, boardState) {
        if (!this.isValidSquare(source) || !this.isValidSquare(target)) return false;
        
        const { fileDiff, rankDiff } = this.getSquareDistance(source, target);
        
        const isValidLShape = (fileDiff === 2 && rankDiff === 1) || 
                             (fileDiff === 1 && rankDiff === 2);
        
        if (!isValidLShape) return false;
        
        // Check if target square is not occupied by own piece
        const targetPiece = boardState && boardState[target];
        if (targetPiece && this.isSameColor(piece, targetPiece)) {
            return false;
        }
        
        return true;
    }
    
    // Pawn move validation with enhanced logic
    isValidPawnMove(source, target, piece, boardState, enPassantSquare = null) {
        if (!this.isValidSquare(source) || !this.isValidSquare(target)) return false;
        
        const isWhite = piece === 'wP';
        const direction = isWhite ? 1 : -1;
        const startRank = isWhite ? 2 : 7;
        
        const fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
        const rankDiff = parseInt(target[1]) - parseInt(source[1]);
        
        // Basic forward move (1 square)
        if (fileDiff === 0 && rankDiff === direction) {
            // Cannot capture forward
            if (boardState && boardState[target]) return false;
            return true;
        }
        
        // Initial double move
        if (fileDiff === 0 && rankDiff === 2 * direction && parseInt(source[1]) === startRank) {
            const middleSquare = String.fromCharCode(source.charCodeAt(0)) + 
                               (parseInt(source[1]) + direction);
            
            // Path must be clear and target must be empty
            if (boardState && (boardState[middleSquare] || boardState[target])) return false;
            return true;
        }
        
        // Capture move (diagonal)
        if (fileDiff === 1 && rankDiff === direction) {
            const targetPiece = boardState && boardState[target];
            
            // Regular capture
            if (targetPiece && !this.isSameColor(piece, targetPiece)) {
                return true;
            }
            
            // En passant
            if (enPassantSquare && target === enPassantSquare) {
                return true;
            }
        }
        
        return false;
    }
    
    // Check if two pieces are the same color
    isSameColor(piece1, piece2) {
        if (!piece1 || !piece2) return false;
        return (piece1[0] === piece2[0]);
    }
    
    // Check if move results in check
    wouldBeInCheck(source, target, piece, boardState, kingPosition) {
        // Create a copy of board state
        const newBoardState = { ...boardState };
        delete newBoardState[source];
        newBoardState[target] = piece;
        
        // Find king position (if moving king, use target square)
        const kingPos = piece.toLowerCase() === 'k' ? target : kingPosition;
        
        // Check if any opponent piece can attack the king
        for (const square in newBoardState) {
            const opponentPiece = newBoardState[square];
            if (this.isSameColor(piece, opponentPiece)) continue;
            
            if (this.canAttackSquare(square, opponentPiece, kingPos, newBoardState)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Check if a piece can attack a specific square
    canAttackSquare(source, piece, target, boardState) {
        const pieceType = piece.toLowerCase();
        
        switch (pieceType) {
            case 'k':
                return this.isValidKingMove(source, target, piece, boardState);
            case 'q':
                return this.isValidQueenMove(source, target, piece, boardState);
            case 'r':
                return this.isValidRookMove(source, target, piece, boardState);
            case 'b':
                return this.isValidBishopMove(source, target, piece, boardState);
            case 'n':
                return this.isValidKnightMove(source, target, piece, boardState);
            case 'p':
                // For pawn attacks, check diagonal capture
                const direction = piece === 'wP' ? 1 : -1;
                const fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
                const rankDiff = parseInt(target[1]) - parseInt(source[1]);
                return fileDiff === 1 && rankDiff === direction;
        }
        
        return false;
    }
}

// Initialize chess validator
const chessValidator = new ChessMoveValidator();

// Legacy functions for backward compatibility
function isValidKingMove(source, target) {
    return chessValidator.isValidKingMove(source, target);
}

function isValidRookMove(source, target) {
    return chessValidator.isValidRookMove(source, target);
}

function isValidQueenMove(source, target) {
    return chessValidator.isValidQueenMove(source, target);
}

function isValidBishopMove(source, target) {
    return chessValidator.isValidBishopMove(source, target);
}

function isValidKnightMove(source, target) {
    return chessValidator.isValidKnightMove(source, target);
}

function isValidPawnMove(source, target, piece) {
    return chessValidator.isValidPawnMove(source, target, piece);
}

function isCastlingMove(from, to, piece) {
    if (piece !== "K" && piece !== "k") return false;
    var rank = from[1];
    if (from[0] === "e" && (to === "g" + rank || to === "c" + rank)) {
        return true;
    }
    return false;
}

// Enhanced board initialization with better UX
function newSampleBoard(idboard, fen, whitePiece, blackPiece, validateFunction) {
    const boardElement = document.getElementById(idboard);
    if (!boardElement) return null;
    
    // Prevent touch scrolling on mobile
    boardElement.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, { passive: false });
    
    // Add loading state
    boardElement.classList.add('loading');
    
    const board = Chessboard(idboard, {
        draggable: true,
        position: fen,
        pieceTheme: 'js/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: function(source, piece, position, orientation) {
            // Add visual feedback
            boardElement.classList.add('dragging');
            return true;
        },
        onDrop: function(source, target, piece) {
            boardElement.classList.remove('dragging');
            
            if (piece === whitePiece || piece === blackPiece) {
                if (validateFunction(source, target, piece)) {
                    // Success animation
                    boardElement.classList.add('success-animation');
                    setTimeout(() => boardElement.classList.remove('success-animation'), 500);
                    return true;
                } else {
                    // Error feedback
                    boardElement.classList.add('error-animation');
                    setTimeout(() => boardElement.classList.remove('error-animation'), 500);
                    return 'snapback';
                }
            }
            return 'snapback';
        },
        onSnapEnd: function() {
            boardElement.classList.remove('loading');
        }
    });
    
    return board;
}

// Add scroll animations to elements
function addScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.card, .section-icon, .board-container').forEach(el => {
        observer.observe(el);
    });
}

// Highlight current navigation link
function highlightCurrentNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification fade-in`;
    notification.innerHTML = `
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        ${message}
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Chess puzzle manager
class ChessPuzzleManager {
    constructor() {
        this.puzzles = [];
        this.currentPuzzle = null;
        this.currentIndex = 0;
        this.score = 0;
        this.loadPuzzles();
    }
    
    loadPuzzles() {
        // Example puzzles (can be loaded from external source)
        this.puzzles = [
            {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
                solution: ['h5f7'],
                hint: 'Mate in 1 move'
            },
            {
                fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
                solution: ['f3e5'],
                hint: 'Win material'
            }
        ];
    }
    
    getCurrentPuzzle() {
        return this.puzzles[this.currentIndex];
    }
    
    nextPuzzle() {
        this.currentIndex = (this.currentIndex + 1) % this.puzzles.length;
        return this.getCurrentPuzzle();
    }
    
    checkSolution(move) {
        const puzzle = this.getCurrentPuzzle();
        if (puzzle.solution.includes(move)) {
            this.score += 10;
            showNotification('Correct! +10 points', 'success');
            return true;
        } else {
            showNotification('Incorrect. Try again!', 'danger');
            return false;
        }
    }
}

// Initialize puzzle manager
const puzzleManager = new ChessPuzzleManager();

// Initialize Stockfish integration
function initStockfishIntegration() {
    if (!document.getElementById('stockfishBoard')) return;
    
    const boardElement = document.getElementById('stockfishBoard');
    boardElement.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, { passive: false });
    
    let board = null;
    let game = new Chess();
    let playerColor = 'white';
    
    function onDragStart(source, piece, position, orientation) {
        if (game.game_over()) return false;
        if ((orientation === 'white' && piece.search(/^b/) !== -1) ||
            (orientation === 'black' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }
    
    function makeStockfishMove() {
        const possibleMoves = game.moves();
        if (possibleMoves.length === 0 || game.game_over()) return;
        
        // Show thinking indicator
        $('#thinkingIndicator').show();
        
        $.ajax({
            url: "https://stockfish.online/api/s/v2.php",
            type: "GET",
            data: { fen: game.fen(), depth: 10 },
            dataType: "json",
            success: function(response) {
                $('#thinkingIndicator').hide();
                
                if (!response.success) {
                    console.error("Stockfish API error:", response.data);
                    showNotification("Error communicating with chess engine", "danger");
                    return;
                }
                
                try {
                    let best = response && response.bestmove;
                    let move = null;
                    
                    if (typeof best === 'string') {
                        const parts = best.split(/\s+/);
                        move = parts[0];
                    } else if (best && typeof best === 'object' && best.move) {
                        move = best.move;
                    }
                    
                    if (!move) {
                        console.error('No move returned by Stockfish API', response);
                        return;
                    }
                    
                    game.move(move, { sloppy: true });
                    board.position(game.fen());
                    
                    // Check game status
                    checkGameStatus();
                } catch (e) {
                    console.error('Error processing Stockfish response', e, response);
                    showNotification("Error processing chess move", "danger");
                }
            },
            error: function(xhr, status, error) {
                $('#thinkingIndicator').hide();
                console.error("Error en la consulta:", error);
                showNotification("Connection error. Please try again.", "warning");
            }
        });
    }
    
    function onDrop(source, target) {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        
        if (move === null) return 'snapback';
        
        // Check if move is valid according to chess rules
        if (move.flags.includes('k') || move.flags.includes('q')) {
            showNotification('Castling!', 'info');
        } else if (move.flags.includes('e')) {
            showNotification('En passant!', 'info');
        } else if (move.captured) {
            showNotification(`Captured ${move.captured}!`, 'info');
        }
        
        // Make Stockfish move after a short delay
        setTimeout(makeStockfishMove, 500);
    }
    
    function onSnapEnd() {
        board.position(game.fen());
    }
    
    function checkGameStatus() {
        if (game.in_checkmate()) {
            const winner = game.turn() === 'w' ? 'Black' : 'White';
            showNotification(`Checkmate! ${winner} wins!`, 'success');
        } else if (game.in_stalemate()) {
            showNotification('Stalemate! Game is a draw.', 'warning');
        } else if (game.in_threefold_repetition()) {
            showNotification('Threefold repetition! Game is a draw.', 'warning');
        } else if (game.in_draw()) {
            showNotification('Draw!', 'warning');
        } else if (game.in_check()) {
            showNotification('Check!', 'info');
        }
    }
    
    function newGame(orientation) {
        playerColor = orientation;
        game = new Chess();
        
        const config = {
            draggable: true,
            position: 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd,
            orientation: orientation,
            pieceTheme: 'js/img/chesspieces/wikipedia/{piece}.png'
        };
        
        board = Chessboard('stockfishBoard', config);
        $(window).resize(() => board.resize());
        
        // If playing as black, let Stockfish make the first move
        if (orientation === 'black') {
            setTimeout(makeStockfishMove, 1000);
        }
    }
    
    // Button event handlers
    $('#newGameWhite').on('click', () => newGame('white'));
    $('#newGameBlack').on('click', () => newGame('black'));
    $('#undoMove').on('click', function() {
        game.undo();
        board.position(game.fen());
    });
    $('#resetGame').on('click', () => newGame(playerColor));
    
    // Initialize with white orientation
    newGame('white');
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .dragging {
        cursor: grabbing;
    }
    
    .success-animation {
        animation: pulse-success 0.5s ease;
    }
    
    .error-animation {
        animation: shake 0.5s ease;
    }
    
    @keyframes pulse-success {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(46, 204, 113, 0.5); }
        100% { transform: scale(1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .notification {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    #thinkingIndicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        display: none;
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is ready
$(document).ready(function() {
    // Initialize Stockfish integration if on the correct page
    if (document.getElementById('stockfishBoard')) {
        initStockfishIntegration();
    }
    
    // Initialize sample boards
    if (document.getElementById('ejemplo1')) {
        var board = Chessboard('ejemplo1', {
            position: 'start',
            pieceTheme: 'js/img/chesspieces/wikipedia/{piece}.png'
        });
    }
    
    if (document.getElementById('ejemploMovRey')) {
        newSampleBoard('ejemploMovRey', '8/8/8/3k4/8/8/8/3K4', "wK", "bK", isValidKingMove);
    }
    
    if (document.getElementById('ejemploMovDama')) {
        newSampleBoard('ejemploMovDama', '8/8/8/8/4q3/8/8/Q7', "wQ", "bQ", isValidQueenMove);
    }
    
    if (document.getElementById('ejemploMovTorre')) {
        newSampleBoard('ejemploMovTorre', '8/8/8/8/4r3/8/8/7R', "wR", "bR", isValidRookMove);
    }
    
    if (document.getElementById('ejemploMovAlfil')) {
        newSampleBoard('ejemploMovAlfil', '8/8/8/3B4/8/8/8/b7', "wB", "bB", isValidBishopMove);
    }
    
    if (document.getElementById('ejemploMovCaballo')) {
        newSampleBoard('ejemploMovCaballo', '7N/8/8/3N4/8/8/8/2n5', "wN", "bN", isValidKnightMove);
    }
    
    if (document.getElementById('ejemploMovPeon')) {
        newSampleBoard('ejemploMovPeon', '8/8/p7/6n1/6P1/8/3P4/8', "wP", "bP", isValidPawnMove);
    }
    
    if (document.getElementById('ejemploCapRey')) {
        newSampleBoard('ejemploCapRey', '8/8/2P5/3k4/2b1R3/8/8/3Kn3', "wK", "bK", isValidKingMove);
    }
    
    if (document.getElementById('ejemploCapDama')) {
        newSampleBoard('ejemploCapDama', '8/3R4/4q3/8/8/Q2N4/1n6/8', "wQ", "bQ", isValidQueenMove);
    }
    
    if (document.getElementById('ejemploCapTorre')) {
        newSampleBoard('ejemploCapTorre', '8/8/1R3r2/8/8/8/1P3r2/8', "wR", "bR", isValidRookMove);
    }
    
    if (document.getElementById('ejemploCapAlfil')) {
        newSampleBoard('ejemploCapAlfil', '5q2/6B1/8/8/3Q4/5b2/6P1/8', "wB", "bB", isValidBishopMove);
    }
    
    if (document.getElementById('ejemploCapCaballo')) {
        newSampleBoard('ejemploCapCaballo', '7r/8/6N1/8/5q2/2n5/PPP5/8', "wN", "bN", isValidKnightMove);
    }
    
    if (document.getElementById('ejemploCapPeon')) {
        newSampleBoard('ejemploCapPeon', '8/5p2/6Q1/8/8/1bn5/1P6/8', "wP", "bP", isValidPawnMove);
    }
});

function isValidKingMove(source, target) {
    var fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
    var rankDiff = Math.abs(parseInt(source[1]) - parseInt(target[1]));
    if (fileDiff === 0 && rankDiff === 0) return false;
    return (fileDiff <= 1 && rankDiff <= 1);
}

function isValidRookMove(source, target) {
    var fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
    var rankDiff = Math.abs(parseInt(source[1]) - parseInt(target[1]));
    return ((fileDiff === 0 || rankDiff === 0) && source !== target);
}

function isValidQueenMove(source, target) {
    var fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
    var rankDiff = Math.abs(parseInt(source[1]) - parseInt(target[1]));
    var isHorizontalOrVertical = fileDiff === 0 || rankDiff === 0;
    var isDiagonal = fileDiff === rankDiff;
    var isSameSquare = source === target;
    return (isHorizontalOrVertical || isDiagonal) && !isSameSquare;
}

function isValidBishopMove(source, target) {
    var fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
    var rankDiff = Math.abs(parseInt(source[1]) - parseInt(target[1]));
    return (fileDiff === rankDiff && source !== target);
}

function isValidKnightMove(source, target) {
    var fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
    var rankDiff = Math.abs(parseInt(source[1]) - parseInt(target[1]));
    return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
}

function isValidPawnMove(source, target, piece) {
    var fileDiff = Math.abs(source.charCodeAt(0) - target.charCodeAt(0));
    var rankDiff = parseInt(target[1]) - parseInt(source[1]);

    if (piece === 'wP') {
        if (fileDiff === 0 && (rankDiff === 1 || (rankDiff === 2 && source[1] === '2'))) return true;
        if (fileDiff === 1 && rankDiff === 1) return true;
    }

    if (piece === 'bP') {
        if (fileDiff === 0 && (rankDiff === -1 || (rankDiff === -2 && source[1] === '7'))) return true;
        if (fileDiff === 1 && rankDiff === -1) return true;
    }

    return false;
}

function isCastlingMove(from, to, piece) {
    if (piece !== "K" && piece !== "k") return false;
    var rank = from[1];
    if (from[0] === "e" && (to === "g" + rank || to === "c" + rank)) {
        return true;
    }
    return false;
}

function newSampleBoard(idboard, fen, whitePiece, blackPiece, validateFunction) {
    document.getElementById(idboard).addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, { passive: false });

    return Chessboard(idboard, {
        draggable: true,
        position: fen,
        onDrop: function(source, target, piece) {
            if (piece === whitePiece || piece === blackPiece) {
                if (validateFunction(source, target, piece)) {
                    return true;
                } else {
                    return 'snapback';
                }
            }
            return 'snapback';
        }
    });
}

$(document).ready(function() {
    if (document.getElementById('ejemplo1')) {
        var board = Chessboard('ejemplo1', 'start');
    }
    if (document.getElementById('ejemploMovRey')) {
        newSampleBoard('ejemploMovRey', '8/8/8/3k4/8/8/8/3K4', "wK", "bK", isValidKingMove);
    }
    if (document.getElementById('ejemploMovDama')) {
        newSampleBoard('ejemploMovDama', '8/8/8/8/4q3/8/8/Q7', "wQ", "bQ", isValidQueenMove);
    }
    if (document.getElementById('ejemploMovTorre')) {
        newSampleBoard('ejemploMovTorre', '8/8/8/8/4r3/8/8/7R', "wR", "bR", isValidRookMove);
    }
    if (document.getElementById('ejemploMovAlfil')) {
        newSampleBoard('ejemploMovAlfil', '8/8/8/3B4/8/8/8/b7', "wB", "bB", isValidBishopMove);
    }
    if (document.getElementById('ejemploMovCaballo')) {
        newSampleBoard('ejemploMovCaballo', '7N/8/8/3N4/8/8/8/2n5', "wN", "bN", isValidKnightMove);
    }
    if (document.getElementById('ejemploMovPeon')) {
        newSampleBoard('ejemploMovPeon', '8/8/p7/6n1/6P1/8/3P4/8', "wP", "bP", isValidPawnMove);
    }
    if (document.getElementById('ejemploCapRey')) {
        newSampleBoard('ejemploCapRey', '8/8/2P5/3k4/2b1R3/8/8/3Kn3', "wK", "bK", isValidKingMove);
    }
    if (document.getElementById('ejemploCapDama')) {
        newSampleBoard('ejemploCapDama', '8/3R4/4q3/8/8/Q2N4/1n6/8', "wQ", "bQ", isValidQueenMove);
    }
    if (document.getElementById('ejemploCapTorre')) {
        newSampleBoard('ejemploCapTorre', '8/8/1R3r2/8/8/8/1P3r2/8', "wR", "bR", isValidRookMove);
    }
    if (document.getElementById('ejemploCapAlfil')) {
        newSampleBoard('ejemploCapAlfil', '5q2/6B1/8/8/3Q4/5b2/6P1/8', "wB", "bB", isValidBishopMove);
    }
    if (document.getElementById('ejemploCapCaballo')) {
        newSampleBoard('ejemploCapCaballo', '7r/8/6N1/8/5q2/2n5/PPP5/8', "wN", "bN", isValidKnightMove);
    }
    if (document.getElementById('ejemploCapPeon')) {
        newSampleBoard('ejemploCapPeon', '8/5p2/6Q1/8/8/1bn5/1P6/8', "wP", "bP", isValidPawnMove);
    }

    if (document.getElementById('stockfishBoard')) {
        document.getElementById('stockfishBoard').addEventListener('touchmove', function(event) {
            event.preventDefault();
        }, { passive: false });

        var board = null;
        var game = new Chess();

        function onDragStart(source, piece, position, orientation) {
            if (game.game_over()) return false;
            if (orientation === 'white') {
                if (piece.search(/^b/) !== -1) return false;
            } else {
                if (piece.search(/^w/) !== -1) return false;
            }
        }

        function makeStockfishMove() {
            var possibleMoves = game.moves();
            if (possibleMoves.length === 0) return;

            $.ajax({
                url: "https://stockfish.online/api/s/v2.php",
                type: "GET",
                data: { fen: game.fen(), depth: 10 },
                dataType: "json",
                success: function(response) {
                    if (!response.success) {
                        console.error("Stockfish API error:", response.data);
                        alert("Error communicating with the chess engine: " + response.data);
                        return;
                    }
                    try {
                        var best = response && response.bestmove;
                        var moving = null;
                        if (typeof best === 'string') {
                            var parts = best.split(/\s+/);
                            moving = parts[0];
                        } else if (best && typeof best === 'object' && best.move) {
                            moving = best.move;
                        }

                        if (!moving) {
                            console.error('No move returned by Stockfish API', response);
                            return;
                        }

                        game.move(moving, { sloppy: true });
                        board.position(game.fen());
                    } catch (e) {
                        console.error('Error processing Stockfish response', e, response);
                    }
                },
                error: function(xhr, status, error) {
                    console.error("Error en la consulta:", error);
                }
            });
        }

        function onDrop(source, target) {
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q'
            });

            if (move === null) return 'snapback';

            makeStockfishMove();
        }

        function onSnapEnd() {
            board.position(game.fen());
        }

        var config = {
            draggable: true,
            position: 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd,
            orientation: 'white'
        };
        board = Chessboard('stockfishBoard', config);

        $('#newGameWhite').on('click', function() {
            var config = {
                draggable: true,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd,
                orientation: 'white'
            };
            game = new Chess();
            board = Chessboard('stockfishBoard', config);
        });

        $('#newGameBlack').on('click', function() {
            var config = {
                draggable: true,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd,
                orientation: 'black'
            };
            board = Chessboard('stockfishBoard', config);
            game = new Chess();
            makeStockfishMove();
        });
    }

    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 600);
    });
});
