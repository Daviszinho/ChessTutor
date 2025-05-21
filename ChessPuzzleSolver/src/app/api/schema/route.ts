import { NextResponse } from 'next/server';
import { puzzleService } from '@/services/puzzle-service';

export async function GET() {
  try {
    const schema = await puzzleService.getTableSchema();
    return NextResponse.json(schema);
  } catch (error: unknown) {
    console.error('Error fetching schema:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch schema', details: errorMessage },
      { status: 500 }
    );
  }
}
