import { NextResponse } from 'next/server';
import { puzzleService } from '@/services/puzzle-service';

export async function GET() {
  try {
    const puzzle = await puzzleService.getRandomPuzzle();

    if (!puzzle) {
      return NextResponse.json(
        { error: 'No puzzle found' },
        { status: 404 }
      );
    }

    return NextResponse.json(puzzle);
  } catch (error: unknown) {
    console.error('Error in puzzle API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch puzzle',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
