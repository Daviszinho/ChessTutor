import { BigQuery } from '@google-cloud/bigquery';

interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  rating?: number;
  themes?: string[];
}

export class PuzzleService {
  private bigquery: BigQuery;
  public projectId: string;
  public datasetId: string = 'matechessproblems';
  public tableId: string = 'matechesspuzzles';

  constructor(projectId: string) {
    this.projectId = projectId;
    this.bigquery = new BigQuery({ projectId });
  }

  // Convert UCI move to the format expected by the chess engine
  private uciToAlgebraic(uciMove: string): string {
    try {
      // If it's already in the correct format (e.g., g6-f8), return as is
      if (uciMove.match(/^[a-h][1-8]-[a-h][1-8]$/)) {
        return uciMove;
      }
      
      // If it's in UCI format (e.g., g6f8), convert to g6-f8
      if (uciMove.match(/^[a-h][1-8][a-h][1-8]$/)) {
        return `${uciMove.substring(0, 2)}-${uciMove.substring(2)}`;
      }
      
      // If it's in standard algebraic notation (e.g., Nxf8), we need to handle it differently
      // For now, just return as is and log a warning
      console.warn('Unexpected move format, returning as is:', uciMove);
      return uciMove;
    } catch (e) {
      console.warn('Error processing move:', uciMove, e);
      return uciMove;
    }
  }

  async getRandomPuzzle(): Promise<Puzzle | null> {
    const query = `
      SELECT 
        FEN,
        moves as solution,
        CAST(rating AS INT64) as rating,
        themes
      FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
      WHERE LENGTH(moves) > 0
      ORDER BY RAND()
      LIMIT 1
    `;

    try {
      console.log('Executing BigQuery query:', query);
      const [rows] = await this.bigquery.query({ query });

      if (!rows || rows.length === 0) {
        console.log('No puzzles found in the database');
        return null;
      }

      const puzzle = rows[0] as any;
      console.log('Raw puzzle data from BigQuery:', JSON.stringify(puzzle, null, 2));
      
      // Handle the solution field which might be a string or array
      let solution: string[] = [];
      if (puzzle.solution) {
        let moves: string[] = [];
        
        if (Array.isArray(puzzle.solution)) {
          // If it's already an array, use it directly
          moves = puzzle.solution;
        } else if (typeof puzzle.solution === 'string') {
          // If it's a string, split by spaces and clean up
          moves = puzzle.solution.split(/\s+/).filter((s: string) => s.trim() !== '');
        }
        
        // Convert moves to the expected format (e.g., g6f8 -> g6-f8)
        solution = moves.map(move => this.uciToAlgebraic(move));
      }

      // Ensure the FEN is valid and has all required parts
      let fen = puzzle.FEN || '';
      if (fen && !fen.includes(' ')) {
        // If FEN is missing the turn indicator, add it (default to white to move)
        fen += ' w - - 0 1';
      }

      const result = {
        id: `puzzle-${Date.now()}`,
        fen: fen,
        solution: solution,
        rating: puzzle.rating || 1500,
        themes: Array.isArray(puzzle.themes) ? puzzle.themes : []
      };

      console.log('Processed puzzle data:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error fetching puzzle from BigQuery:', error);
      throw error;
    }
  }

  async getTableSchema(): Promise<any> {
    try {
      const query = `
        SELECT 
          column_name, 
          data_type,
          is_nullable,
          column_default
        FROM \`${this.projectId}.${this.datasetId}.INFORMATION_SCHEMA.COLUMNS\`
        WHERE table_name = @tableName
        ORDER BY ordinal_position
      `;

      const [rows] = await this.bigquery.query({
        query,
        params: {
          tableName: this.tableId
        }
      });
      
      return rows;
    } catch (error) {
      console.error('Error fetching table schema:', error);
      throw error;
    }
  }

  // Note: This method is kept for compatibility but might not work as expected
  // since we don't have an ID column in our current table schema.
  // Consider using getRandomPuzzle() instead.
  async getPuzzleById(id: string): Promise<Puzzle | null> {
    // Since we don't have an ID column, we'll just return a random puzzle
    // to maintain compatibility with the interface
    console.warn('getPuzzleById called, but ID-based lookup is not supported. Returning random puzzle.');
    return this.getRandomPuzzle();
  }
}

// Export a singleton instance
export const puzzleService = new PuzzleService(process.env.GOOGLE_CLOUD_PROJECT || 'idyllic-parser-460423-r0');
