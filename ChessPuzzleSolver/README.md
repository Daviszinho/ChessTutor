# ChessMaestro - Chess Puzzle Solver

This is a Next.js application that allows users to solve chess puzzles. It's built using `react-chessboard` for the UI and `chess.js` for chess logic, containerized with Docker and ready for deployment to Google Cloud Run.

## Features

- **Board Setup from FEN**: Renders a chess board from a FEN (Forsyth-Edwards Notation) string.
- **Interactive Puzzle Solving**: Users can drag and drop pieces to make moves. Legal moves for a selected or hovered piece are highlighted.
- **Guided Solution**: The application expects a sequence of moves (player and opponent responses). The user can only play the next expected move for their turn.
- **Automatic Opponent Moves**: If the solution sequence includes opponent moves, they are played automatically after the user makes their correct move.
- **Error Feedback**: Provides messages for illegal moves or incorrect puzzle moves.
- **Collapsible Solution Panel**: A panel displays the full sequence of moves for the puzzle, which can be toggled.
- **Victory Notification**: A non-dismissible modal congratulates the user upon successfully completing the puzzle sequence.

## Running the Application

1.  **Install dependencies**:
    Make sure you have Node.js and npm (or yarn) installed.
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002` (or the port specified in your `package.json` scripts).

## Deployment to Google Cloud Run

This project is configured for deployment to Google Cloud Run using Cloud Build. Follow these steps to deploy:

### Prerequisites

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Enable required APIs:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

### Deploying the Application

1. Submit the build to Cloud Build:
   ```bash
   gcloud builds submit --config=cloudbuild.yaml .
   ```

2. After a successful build, your application will be available at the URL provided in the Cloud Run console.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=production
# Add other environment variables as needed
```

## Building Locally with Docker

To build and run the container locally:

```bash
# Build the Docker image
docker build -t chess-puzzle-solver .

# Run the container
docker run -p 9002:9002 --env-file .env chess-puzzle-solver
```

The application will be available at `http://localhost:9002`

## How to Supply FEN and Solution

The FEN string and the solution move sequence are primarily configured within the application's source code.

1.  Open the file `src/app/page.tsx`.
2.  Inside the `HomePage` component, you'll find the `<ChessMaestro />` component being used. You can modify its `fen` and `solution` props:

    ```tsx
    // src/app/page.tsx
    import ChessMaestro from '@/components/ChessMaestro';
    import { Toaster } from "@/components/ui/toaster";

    export default function HomePage() {
      // Example: Define your custom puzzle
      const customFen = "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"; // Your FEN string
      const customSolution = ["e5", "Nf6", "d4"]; // Your solution sequence (player and opponent moves)

      return (
        <main className="min-h-screen bg-background text-foreground py-8">
          <ChessMaestro
            fen={customFen}
            solution={customSolution}
            boardOrientation="white" // or "black" if the puzzle is from Black's perspective
          />
          <Toaster />
        </main>
      );
    }
    ```

    -   **`fen`**: A string representing the Forsyth-Edwards Notation of the starting position of the puzzle. This FEN string dictates whose turn it is to move initially.
    -   **`solution`**: An array of strings. Each string is a move in Standard Algebraic Notation (SAN). This array should represent the *entire correct sequence of moves* for the puzzle, including both the player's moves and any opponent responses, in the order they occur. The application will guide the user through their turns and automate the opponent's moves based on this sequence.
    -   **`boardOrientation`**: Optional, defaults to `'white'`. Set this to `'black'` if the puzzle is intended to be solved from Black's perspective. This primarily affects the visual orientation of the board. The player whose turn it is to make a move is determined by the FEN string and the current state of the `solution` sequence.

## Technical Stack

- Next.js (v15)
- React (v18)
- TypeScript
- `react-chessboard` (for the chessboard UI and interaction)
- `chess.js` (v1.x for chess logic, move validation, and FEN operations)
- Tailwind CSS (for styling)
- ShadCN/UI (for pre-built UI components like buttons, dialogs, cards)
- Lucide React (for icons)

## Notes on Puzzle Logic

- The application strictly follows the `solution` array. The user must play the exact move specified for their turn in the sequence.
- Opponent moves listed in the `solution` array are played automatically by the system.
- Highlighting shows legal moves for the current player's pieces, but only the specific correct puzzle move will advance the state.
- The player whose turn it is to physically interact with the board is determined by the `boardOrientation` prop (e.g., if 'white', only white pieces are draggable by the user when it's white's turn in the sequence). The game logic itself follows the turn order dictated by the FEN and the `solution` sequence.
