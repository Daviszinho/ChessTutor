// src/components/ChessMaestro.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard, type Piece, type BoardOrientation } from 'react-chessboard';
import type { CustomSquareStyles, PromotionPieceOption } from 'react-chessboard/dist/chessboard/types';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added import
import SolutionPanel from './SolutionPanel';
import { Terminal, CheckCircle, XCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface ChessMaestroProps {
  fen: string;
  solution: string[]; // Array of SAN moves, includes player and opponent moves
  boardOrientation?: BoardOrientation;
}

const ChessMaestro: FC<ChessMaestroProps> = ({ fen, solution, boardOrientation = 'white' }) => {
  const game = useMemo(() => new Chess(), []);
  const [currentFen, setCurrentFen] = useState<string>(fen);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0); // Index in the 'solution' array
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showSolutionPanel, setShowSolutionPanel] = useState<boolean>(false);
  const [optionSquares, setOptionSquares] = useState<CustomSquareStyles>({});
  const [moveFrom, setMoveFrom] = useState<Square | ''>('');
  const [rightClickedSquares, setRightClickedSquares] = useState<CustomSquareStyles>({});

  const playerColor = useMemo(() => (boardOrientation === 'white' ? 'w' : 'b'), [boardOrientation]);

  const resetPuzzle = useCallback(() => {
    try {
      game.load(fen);
    } catch (e) {
      console.error("Invalid FEN", e);
      setErrorMessage("Error: Invalid starting position (FEN).");
      game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // Default FEN
    }
    setCurrentFen(game.fen());
    setCurrentMoveIndex(0);
    setErrorMessage(null);
    setIsSolved(false);
    // setShowSolutionPanel(false); // Keep solution panel state if user wants it open
    setOptionSquares({});
    setMoveFrom('');
    setRightClickedSquares({});
  }, [fen, game]);

  useEffect(() => {
    resetPuzzle();
  }, [fen, solution, resetPuzzle]);

  const highlightLegalMoves = useCallback((sourceSquare: Square) => {
    const moves = game.moves({ square: sourceSquare, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newOptionSquares: CustomSquareStyles = {};
    moves.forEach((move) => {
      newOptionSquares[move.to] = {
        background: game.get(move.to) && game.get(move.to)?.color !== game.get(sourceSquare)?.color
          ? 'radial-gradient(circle, hsla(var(--accent), 0.3) 85%, transparent 85%)'
          : 'radial-gradient(circle, hsla(var(--accent), 0.3) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newOptionSquares[sourceSquare] = {
      background: 'hsla(var(--accent),0.5)', 
    };
    setOptionSquares(newOptionSquares);
  }, [game]);

  const onPieceDragBegin = useCallback((_piece: Piece, sourceSquare: Square) => {
    if (game.turn() !== playerColor || isSolved) return;
    setMoveFrom(sourceSquare);
    highlightLegalMoves(sourceSquare);
  }, [game, playerColor, isSolved, highlightLegalMoves]);

  const handleMoveProcessing = useCallback((source: Square, target: Square, promotionPiece?: PromotionPieceOption): boolean => {
    if (isSolved || game.turn() !== playerColor) return false;

    const expectedMoveSan = solution[currentMoveIndex];
    if (!expectedMoveSan) {
        setErrorMessage("No more moves in solution.");
        return false;
    }

    try {
      // Create a temporary game instance to validate the move's SAN form
      // without altering the main game state yet.
      const tempGame = new Chess(game.fen());
      const attemptedMoveObject = tempGame.move({
        from: source,
        to: target,
        promotion: promotionPiece,
      });

      if (attemptedMoveObject === null) {
        setErrorMessage("That's an illegal move.");
        return false; // Move is illegal by chess.js rules
      }
      
      const normalizeSan = (san: string) => san.replace(/[+#]$/, ''); // Remove check/mate symbols
      const normalizedAttemptedSan = normalizeSan(attemptedMoveObject.san);
      const normalizedExpectedSan = normalizeSan(expectedMoveSan);

      if (normalizedAttemptedSan === normalizedExpectedSan) {
        // Correct move, apply to the main game instance
        game.move({ from: source, to: target, promotion: promotionPiece });
        setCurrentFen(game.fen()); // Update the board display
        setErrorMessage(null);
        
        const newMoveIndex = currentMoveIndex + 1;
        setCurrentMoveIndex(newMoveIndex);

        if (newMoveIndex >= solution.length) {
          setIsSolved(true); // Puzzle solved
        }
        // Automatic opponent move will be handled by the useEffect listening to currentFen/currentMoveIndex
        return true;
      } else {
        // Move is legal but not the correct one for the puzzle
        setErrorMessage(`Incorrect move (${attemptedMoveObject.san}). Expected: ${expectedMoveSan}. Try again.`);
        return false;
      }
    } catch (error) {
      // Catch any unexpected errors during move processing
      console.error("Error making move:", error);
      setErrorMessage("An unexpected error occurred while processing the move.");
      return false;
    }
  }, [game, playerColor, isSolved, solution, currentMoveIndex]);

  const onSquareClick = useCallback((square: Square) => {
    if (game.turn() !== playerColor || isSolved) return;

    if (moveFrom) { // A piece is already selected, try to move it
      handleMoveProcessing(moveFrom, square);
      setMoveFrom(''); 
      setOptionSquares({}); // Clear highlights after attempting move
    } else { // No piece selected, try to select one
      const pieceOnSquare = game.get(square);
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setMoveFrom(square);
        highlightLegalMoves(square);
      }
    }
  }, [moveFrom, game, playerColor, isSolved, highlightLegalMoves, handleMoveProcessing]);

  const onMouseOverSquare = useCallback((square: Square) => {
    if (!moveFrom && game.turn() === playerColor && !isSolved) {
       const pieceOnSquare = game.get(square);
       if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
         highlightLegalMoves(square);
       }
    }
  }, [moveFrom, game, playerColor, isSolved, highlightLegalMoves]);

  const onMouseOutSquare = useCallback(() => {
    if (!moveFrom) { // Only clear highlights if not actively selecting a piece
        setOptionSquares({});
    }
  }, [moveFrom]);
  
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, _piece: Piece): boolean => {
    if (game.turn() !== playerColor || isSolved) return false;
    // Promotion will be handled by react-chessboard's default dialog if needed.
    // The `promotion` argument would be passed to handleMoveProcessing by react-chessboard if a promotion occurs.
    // For simplicity, this example doesn't explicitly handle the promotion dialog callback here,
    // assuming react-chessboard provides the promotion piece to the move function if one is chosen.
    // `chess.js` itself needs the promotion piece for pawn promotion moves.
    // `react-chessboard` onPieceDrop usually returns a boolean to accept/reject the move visually.
    const success = handleMoveProcessing(sourceSquare, targetSquare);
    setMoveFrom(''); // Reset piece selection state
    setOptionSquares({}); // Clear highlights
    return success; 
  }, [game, playerColor, isSolved, handleMoveProcessing]);
  
  // Effect for automatic opponent moves
  useEffect(() => {
    if (isSolved || game.turn() === playerColor || currentMoveIndex >= solution.length) {
      return; // Not opponent's turn, or puzzle solved, or no more moves
    }

    // Opponent's turn
    const makeOpponentMove = async () => {
      const opponentMoveSan = solution[currentMoveIndex];
      if (!opponentMoveSan) return; // Should not happen if logic is correct

      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI

      const moveResult = game.move(opponentMoveSan);
      if (moveResult) {
        setCurrentFen(game.fen());
        const newMoveIndex = currentMoveIndex + 1;
        setCurrentMoveIndex(newMoveIndex);
        if (newMoveIndex >= solution.length) {
          setIsSolved(true);
        }
      } else {
        setErrorMessage(`Critical Error in Solution: Opponent's programmed move (${opponentMoveSan}) is invalid.`);
        console.error("Invalid opponent move in solution sequence:", opponentMoveSan, "FEN:", game.fen());
        // This indicates a problem with the provided 'solution' array.
      }
    };

    makeOpponentMove();
  }, [currentFen, currentMoveIndex, game, isSolved, playerColor, solution]); // currentFen ensures this runs after player's move updates state


  const toggleSolutionPanel = () => {
    setShowSolutionPanel(!showSolutionPanel);
  };
  
  const onSquareRightClick = useCallback((square: Square) => {
    const colour = 'hsla(var(--primary)/0.3)'; // Using primary color for right-click highlight
    setRightClickedSquares(prev => ({
      ...prev,
      [square]:
        prev[square] &&
        prev[square]?.background === colour
          ? undefined
          : { background: colour }
    }));
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center" style={{ maxWidth: '600px' }}>
      <header className="w-full mb-6 text-center">
        <h1 className="text-4xl font-bold text-primary">ChessMaestro</h1>
        <p className="text-muted-foreground">Solve the puzzle by following the correct sequence of moves!</p>
      </header>
      
      <div className="w-full aspect-square max-w-[560px] mb-4 shadow-xl rounded-lg overflow-hidden border-4 border-card">
        <Chessboard
          id="ChessMaestroBoard"
          position={currentFen}
          onPieceDrop={onPieceDrop}
          onPieceDragBegin={onPieceDragBegin}
          onSquareClick={onSquareClick}
          onMouseOverSquare={onMouseOverSquare}
          onMouseOutSquare={onMouseOutSquare}
          onSquareRightClick={onSquareRightClick}
          boardOrientation={boardOrientation}
          customBoardStyle={{
            borderRadius: '0px', 
            boxShadow: 'none', 
          }}
          customDarkSquareStyle={{ backgroundColor: 'hsl(var(--secondary))' }}
          customLightSquareStyle={{ backgroundColor: 'hsl(var(--muted))' }}
          arePiecesDraggable={!isSolved && game.turn() === playerColor}
          customSquareStyles={{
            ...optionSquares,
            ...rightClickedSquares
          }}
          animationDuration={200}
          snapToCursor={true}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4 shadow-md w-full">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Oops!</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4 w-full">
        <div className="text-sm text-muted-foreground">
          <p>Turn: {game.turn() === 'w' ? 'White' : 'Black'} to play</p>
          <p>{solution.length - currentMoveIndex} moves remaining in sequence.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetPuzzle} variant="outline" size="sm" aria-label="Reset Puzzle" title="Reset Puzzle">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={toggleSolutionPanel} variant="outline" size="sm" aria-label={showSolutionPanel ? 'Hide Solution' : 'Show Solution'} title={showSolutionPanel ? 'Hide Solution' : 'Show Solution'}>
            {showSolutionPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {showSolutionPanel && (
        <div className="w-full">
          <SolutionPanel 
            solution={solution} 
            isOpen={showSolutionPanel} 
            currentOverallMoveIndex={currentMoveIndex} 
            initialFen={fen} // Pass the original FEN for consistent turn calculation
            playerColor={playerColor}
          />
        </div>
      )}

      <AlertDialog open={isSolved}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-2xl text-accent">
              <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
              Congratulations!
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center py-4 text-lg">
            You've successfully solved the puzzle!
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetPuzzle} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mt-8 p-4 w-full shadow-md bg-card text-card-foreground">
        <CardHeader className="p-2 pt-0">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <Terminal className="h-5 w-5 mr-2" />
            Puzzle Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-sm text-muted-foreground break-all"><strong>FEN:</strong> {fen}</p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Solution Sequence:</strong> {solution.join(' \u2192 ')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChessMaestro;
