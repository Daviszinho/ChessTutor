// src/components/SolutionPanel.tsx
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Chess } from 'chess.js'; 

interface SolutionPanelProps {
  solution: string[];
  isOpen: boolean;
  currentOverallMoveIndex: number; 
  initialFen: string; // Pass initial FEN to determine turns correctly
  playerColor: 'w' | 'b';
}

const SolutionPanel: FC<SolutionPanelProps> = ({ solution, isOpen, currentOverallMoveIndex, initialFen, playerColor }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Card className="mt-4 shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">Solution Moves</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 max-h-[50vh]">
          <ol className="list-none space-y-1.5 p-1">
            {solution.map((move, index) => {
              const isPastMove = index < currentOverallMoveIndex;
              const isCurrentExpectedMove = index === currentOverallMoveIndex;
              
              // Determine whose move it is based on initial FEN and index
              const initialTurnColor = initialFen.split(' ')[1] as 'w' | 'b';
              const moveByPlayer = (index % 2 === 0 && initialTurnColor === playerColor) || (index % 2 !== 0 && initialTurnColor !== playerColor);
              const moveLabelPrefix = moveByPlayer ? "Your move:" : "Opponent:";


              let textColor = 'text-foreground';
              if (isPastMove) textColor = 'text-muted-foreground line-through';
              else if (isCurrentExpectedMove) textColor = 'font-bold text-accent';
              
              return (
                <li key={index} className={`text-sm p-1.5 rounded-md flex justify-between items-center ${isCurrentExpectedMove ? 'bg-accent/10' : ''}`}>
                  <span className={textColor}>
                    <span className="text-xs text-muted-foreground mr-1">{moveLabelPrefix}</span>
                    {move}
                  </span>
                  {isCurrentExpectedMove && <Badge variant="default" className="ml-2 bg-accent text-accent-foreground">Next</Badge>}
                  {!isCurrentExpectedMove && isPastMove && <Badge variant="outline" className="ml-2">Played</Badge>}
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SolutionPanel;
