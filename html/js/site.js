var board = null;
var game = new Chess();

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
