# ChessTutor 🎮♟️

ChessTutor is an interactive web application designed to help users learn and improve their chess skills through various tutorials, exercises, and interactive features.

## Features

- Interactive chess tutorials
- Basic movement lessons
- Chess history section
- Piece capture tutorials
- Special moves instruction
- Game tempo/rhythm guidance
- Chess notation learning
- Opening theory
- Practice exercises
- Play against Stockfish engine

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Application Settings
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:5001;http://localhost:5000

# Database Connection (if needed)
# DB_CONNECTION_STRING=Server=localhost;Database=ChessTutor;User Id=sa;Password=your_password;

# API Keys (if needed)
# STOCKFISH_API_KEY=your_stockfish_api_key
# CHESS_COM_API_KEY=your_chess_com_api_key

# External Services
# REDIS_CONNECTION=localhost:6379
# CACHE_DURATION_MINUTES=60

# Logging
LOG_LEVEL=Information
# SENTRY_DSN=your_sentry_dsn

# Security
# JWT_SECRET=your_jwt_secret
# TOKEN_EXPIRATION_HOURS=24
```

## Prerequisites

Before you begin, ensure you have the following installed:
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ChessTutor.git
cd ChessTutor
```

2. Install .NET dependencies:
```bash
dotnet restore
```

3. Install Node.js dependencies:
```bash
npm install
```

## Development Setup

1. To run the application in development mode:
```bash
dotnet run
```

2. Open your browser and navigate to:
- https://localhost:5001 (HTTPS)
- http://localhost:5000 (HTTP)

## Docker Support

The application can be run using Docker:

1. Build the Docker image:
```bash
docker build -t chesstutor .
```

2. Run the container:
```bash
docker run -p 8080:80 chesstutor
```

## Project Structure

```
ChessTutor/
├── Controllers/         # MVC Controllers
├── Models/             # Data models
├── Views/              # Razor views
├── wwwroot/           # Static files (CSS, JS, images)
├── Properties/        # Launch settings
└── Program.cs         # Application entry point
```

## Dependencies

### .NET Dependencies
- ASP.NET Core 9.0
- Entity Framework Core (if used)

### Frontend Dependencies
- Bootstrap v5.3.5
- jQuery v3.7.1
- chess.js v1.1.0
- jQuery UI v1.14.1
- jQuery Mobile v1.5.0-alpha.1

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow C# coding conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features
- Keep the code modular and maintainable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- Chess.js library for chess logic
- Stockfish chess engine
- All contributors who have helped with the project

---

Made with ❤️ by the ChessTutor Team