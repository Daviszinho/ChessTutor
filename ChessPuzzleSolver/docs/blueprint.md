# **App Name**: ChessMaestro

## Core Features:

- Board Setup: Accepts a FEN string and renders the initial chess position.
- Puzzle Solution Logic: Verifies user moves against a provided SAN solution, advancing upon correct moves and displaying error messages for incorrect attempts. Announces victory after the final correct move.
- Interactive Piece Movement: Enables pieces to be moved by dragging. Highlights legal destination squares during piece selection or hover.
- Solution Display: A collapsible panel reveals the full solution move list, toggled via a dedicated function.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082) to evoke a sense of strategy and depth, reminiscent of classic chess sets. This will contrast nicely in a light color scheme.
- Background color: Light grey (#E0E0E0) for a clean and neutral backdrop.
- Accent color: A muted purple (#800080) for interactive elements such as highlighting legal moves or displaying the congratulations banner.
- Clean, readable font for displaying FEN strings and error messages.
- Simple icons to indicate legal moves or solution display.
- Minimal layout, focusing on the board, status area, and collapsible solution panel.
- Subtle piece movement animations.