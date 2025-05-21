// src/components/ChessMaestro.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SolutionPanel from './SolutionPanel';
import { Terminal, CheckCircle, XCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface ChessMaestroProps {
  fen: string;
  solution: string[]; // Array of moves in format "e2-e4"
}

const ChessMaestro: FC<ChessMaestroProps> = ({ fen, solution }) => {
  const game = useMemo(() => new Chess(fen), [fen]);
  const [currentFen, setCurrentFen] = useState<string>(game.fen());
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showSolutionPanel, setShowSolutionPanel] = useState<boolean>(false);
  const [optionSquares, setOptionSquares] = useState<CustomSquareStyles>({});
  const [moveFrom, setMoveFrom] = useState<Square | ''>('');
  const [rightClickedSquares, setRightClickedSquares] = useState<CustomSquareStyles>({});
  const [orientation, setOrientation] = useState<BoardOrientation>('white');
  
  // Set up the game and orientation when component mounts or FEN changes
  useEffect(() => {
    try {
      game.load(fen);
      setCurrentFen(game.fen());
      setCurrentMoveIndex(0);
      setIsSolved(false);
      setErrorMessage(null);
      setOptionSquares({});
      setMoveFrom('');
      setRightClickedSquares({});
      const turn = fen.split(' ')[1];
      setOrientation(turn === 'w' ? 'white' : 'black');
    } catch (error) {
      setErrorMessage('Failed to initialize the game. Please try again.');
    }
  }, [fen, game]);
  
  const resetPuzzle = useCallback(() => {
    try {
      game.load(fen);
    } catch (e) {
      setErrorMessage("Error: Invalid starting position (FEN).");
      game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
    setCurrentFen(game.fen());
    setCurrentMoveIndex(0);
    setErrorMessage(null);
    setIsSolved(false);
    setOptionSquares({});
    setMoveFrom('');
    setRightClickedSquares({});
  }, [fen, game]);

  // Only reset state when FEN or solution changes (no auto-move here)
  useEffect(() => {
    game.load(fen);
    setCurrentFen(game.fen());
    setCurrentMoveIndex(0);
    setErrorMessage(null);
    setIsSolved(false);
    setOptionSquares({});
    setMoveFrom('');
    setRightClickedSquares({});
  }, [fen, solution, game]);

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
    // Check if it's the player's turn
    const isPlayerTurn = (game.turn() === 'w' && orientation === 'white') || 
                       (game.turn() === 'b' && orientation === 'black');
    
    if (!isPlayerTurn || isSolved) return;
    
    // Check if the piece being dragged belongs to the player
    const pieceOnSquare = game.get(sourceSquare);
    const pieceColor = pieceOnSquare?.color === 'w' ? 'white' : 'black';
    if (pieceColor !== orientation) return;
    
    setMoveFrom(sourceSquare);
    highlightLegalMoves(sourceSquare);
  }, [game, isSolved, orientation, highlightLegalMoves]);

  const handleMoveProcessing = useCallback((source: Square, target: Square, promotionPiece?: PromotionPieceOption): boolean => {
    if (isSolved) return false;
    
    // Check if it's the player's turn
    const isPlayerTurn = (game.turn() === 'w' && orientation === 'white') || 
                        (game.turn() === 'b' && orientation === 'black');
    
    if (!isPlayerTurn) {
      setErrorMessage("Please wait for your turn.");
      return false;
    }

    const expectedMove = solution[currentMoveIndex];
    if (!expectedMove) {
      setErrorMessage("No more moves in solution.");
      return false;
    }

    try {
      // Convert the expected move from "e2-e4" to {from, to} format
      const [expectedFrom, expectedTo] = expectedMove.split('-');
      if (!expectedFrom || !expectedTo) {
        setErrorMessage("Invalid move format in solution.");
        return false;
      }

      // Check if the move matches the expected move
      if (source !== expectedFrom || target !== expectedTo) {
        // Try to get the piece for a more descriptive error message
        const piece = game.get(source);
        const pieceName = piece ? piece.type.toUpperCase() : 'Piece';
        setErrorMessage(`Incorrect move (${pieceName} to ${target}). Try again.`);
        return false;
      }

      // Make the move on the actual game
      const move = {
        from: source,
        to: target,
        promotion: promotionPiece || 'q' // Default to queen promotion if not specified
      };

      const result = game.move(move);
      if (!result) {
        setErrorMessage("That's an illegal move.");
        return false;
      }

      console.log('Player made move:', move);
      console.log('Current FEN after player move:', game.fen());
      console.log('Next to move:', game.turn() === 'w' ? 'white' : 'black');

      // Update the board state
      setCurrentFen(game.fen());
      setErrorMessage(null);
      
      // Move to the next move in the solution
      const newMoveIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newMoveIndex);

      // Check if puzzle is solved (no more moves)
      if (newMoveIndex >= solution.length) {
        setIsSolved(true);
        return true;
      }

      // The computer will make the next move via the useEffect
      return true;
    } catch (error) {
      console.error("Error making move:", error);
      setErrorMessage("An unexpected error occurred while processing the move.");
      return false;
    }
  }, [game, isSolved, solution, currentMoveIndex]);

  const onSquareClick = useCallback((square: Square) => {
    if (isSolved) return;
    
    // Check if it's the player's turn
    const isPlayerTurn = (game.turn() === 'w' && orientation === 'white') || 
                       (game.turn() === 'b' && orientation === 'black');
    if (!isPlayerTurn) return;

    if (moveFrom) { // A piece is already selected, try to move it
      handleMoveProcessing(moveFrom, square);
      setMoveFrom(''); 
      setOptionSquares({}); // Clear highlights after attempting move
    } else { // No piece selected, try to select one
      const pieceOnSquare = game.get(square);
      const pieceColor = pieceOnSquare?.color === 'w' ? 'white' : 'black';
      if (pieceOnSquare && pieceColor === orientation) {
        setMoveFrom(square);
        highlightLegalMoves(square);
      }
    }
  }, [moveFrom, game, isSolved, orientation, handleMoveProcessing, highlightLegalMoves]);

  const onMouseOverSquare = useCallback((square: Square) => {
    if (isSolved) return;
    
    // Check if it's the player's turn
    const isPlayerTurn = (game.turn() === 'w' && orientation === 'white') || 
                       (game.turn() === 'b' && orientation === 'black');
    if (!isPlayerTurn) return;

    if (!moveFrom) {
      const pieceOnSquare = game.get(square);
      const pieceColor = pieceOnSquare?.color === 'w' ? 'white' : 'black';
      if (pieceOnSquare && pieceColor === orientation) {
        highlightLegalMoves(square);
      }
    }
  }, [moveFrom, game, isSolved, orientation, highlightLegalMoves]);

  const onMouseOutSquare = useCallback(() => {
    if (!moveFrom) { // Only clear highlights if not actively selecting a piece
      setOptionSquares({});
    }
  }, [moveFrom]);
  
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: Piece): boolean => {
    if (isSolved) return false;
    
    // Check if it's the player's turn
    const isPlayerTurn = (game.turn() === 'w' && orientation === 'white') || 
                       (game.turn() === 'b' && orientation === 'black');
    if (!isPlayerTurn) return false;
    
    // Check if the piece being moved belongs to the player
    const pieceOnSquare = game.get(sourceSquare);
    const pieceColor = pieceOnSquare?.color === 'w' ? 'white' : 'black';
    if (pieceColor !== orientation) return false;
    
    // Handle the move
    const success = handleMoveProcessing(sourceSquare, targetSquare, piece[1]?.toLowerCase() as PromotionPieceOption);
    setMoveFrom(''); // Reset piece selection state
    setOptionSquares({}); // Clear highlights
    return success;
  }, [game, isSolved, orientation, handleMoveProcessing]);
  
  // Effect for automatic moves (computer's turn)
  useEffect(() => {
    // Determine who starts the puzzle
    const playerStarts = (fen.split(' ')[1] === (orientation === 'white' ? 'w' : 'b'));
    // Computer moves are at odd indices if player starts, even if computer starts
    const isComputerTurn = playerStarts
      ? currentMoveIndex % 2 === 1
      : currentMoveIndex % 2 === 0;

    if (isSolved || !isComputerTurn || currentMoveIndex >= solution.length) {
      return;
    }

    const makeComputerMove = async () => {
      const computerMove = solution[currentMoveIndex];
      if (!computerMove) return;

      const [from, to] = computerMove.split('-');
      if (!from || !to || from.length !== 2 || to.length !== 2) {
        console.error('Invalid move format in solution:', computerMove);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        game.move({
          from: from as Square,
          to: to as Square,
          promotion: 'q'
        });

        setCurrentFen(game.fen());
        const newMoveIndex = currentMoveIndex + 1;
        setCurrentMoveIndex(newMoveIndex);

        if (newMoveIndex >= solution.length) {
          setIsSolved(true);
        }
      } catch (error) {
        setErrorMessage(`Error making move: ${computerMove}. The puzzle might be unsolvable.`);
      }
    };

    makeComputerMove();
  }, [currentFen, currentMoveIndex, game, isSolved, orientation, solution, fen]);


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

  // Log the current state for debugging
  console.log('Rendering ChessMaestro', {
    currentFen,
    orientation,
    currentMoveIndex,
    solutionLength: solution.length,
    isSolved,
    turn: game.turn(),
    playerTurn: (game.turn() === 'w' && orientation === 'white') || 
               (game.turn() === 'b' && orientation === 'black') ? 'player' : 'computer'
  });

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
          boardOrientation={orientation}
          customBoardStyle={{
            borderRadius: '0px',
            boxShadow: 'none',
          }}
          customDarkSquareStyle={{ backgroundColor: 'hsl(var(--secondary))' }}
          customLightSquareStyle={{ backgroundColor: 'hsl(var(--muted))' }}
          arePiecesDraggable={!isSolved && (
            (game.turn() === 'w' && orientation === 'white') || 
            (game.turn() === 'b' && orientation === 'black')
          )}
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
            initialFen={fen}
            boardOrientation={orientation}
          />
        </div>
      )}

      {isSolved && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle>Puzzle Solved!</AlertTitle>
          <AlertDescription>Great job! You've completed the puzzle.</AlertDescription>
        </Alert>
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
