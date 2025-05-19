// src/app/page.tsx
import ChessMaestro from '@/components/ChessMaestro';
import { Toaster } from "@/components/ui/toaster";

// Example Puzzle 1: Scholar's Mate (White to execute from a certain point)
// FEN after 1. e4 e5
const scholarFenStart = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2";
// Solution sequence: White plays Qh5, Black (auto) plays Nc6, White plays Bc4, Black (auto) plays Nf6, White plays Qxf7#
const scholarSolution = ["Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"];

// Example Puzzle 2: Shortest Mate in 1 for White
const mateInOneFen = "4k3/R7/8/8/8/8/8/4K3 w - - 0 1"; // White to play Ra8#
const mateInOneSolution = ["Ra8#"];


// Example Puzzle 3: Black to play and mate in 1
// Position after 1.e4 e5 2.f4 Qh4+ 3.g3. Black to play Qxg3#
const blackMateInOneSetup = "rnb1kbnr/pppp1ppp/8/4p3/5P1q/N1P3P1/PP1PP2P/R1BQKBNR b KQkq - 0 3"; // Corrected FEN for black to move. Original was missing a move or piece.
const blackMateInOneSolution = ["Qxg3#"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-8">
      <ChessMaestro
        fen={scholarFenStart} 
        solution={scholarSolution} 
        boardOrientation="white" 
      />
      {/* 
      Uncomment to try other puzzles:
      
      <div className="my-12 border-t-2 border-dashed border-primary pt-8">
        <ChessMaestro
          fen={mateInOneFen}
          solution={mateInOneSolution}
          boardOrientation="white" 
        />
      </div>

      <div className="my-12 border-t-2 border-dashed border-primary pt-8">
        <ChessMaestro
          fen={blackMateInOneSetup}
          solution={blackMateInOneSolution}
          boardOrientation="black"
        />
      </div> 
      */}
      <Toaster />
    </main>
  );
}
