# Chess Puzzle Solver

Aplicación para resolver problemas de ajedrez desplegada en Google Cloud Run.

## Requisitos
- Docker
- Cuenta de Google Cloud Platform
- Google Cloud SDK

## Configuración Inicial

### 1. Autenticación GCP
```bash
gcloud auth login
gcloud config set project idyllic-parser-460423-r0
```

### 2. Configurar Docker
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## Construir y Desplegar

### 1. Construir la imagen
```bash
cd /home/daviszinho/Documents/ChessTutor/ChessTutor/ChessPuzzleSolver
sudo docker build -t gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver .
sudo docker tag gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver:latest
```

### 2. Subir a GCR
```bash
gcloud auth application-default login
sudo docker push gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver:latest
```

### 3. Desplegar en Cloud Run
```bash
gcloud run deploy chess-puzzle-solver \
  --image gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver \
  --platform managed \
  --region us-central1 \
  --cpu 1 \
  --memory 512Mi \
  --port 3000 \
  --allow-unauthenticated \
  --timeout 30s
```

## GitHub Actions
El workflow se activa con cambios en la rama `main`.

## Solución de Problemas

### Permisos Docker
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Autenticación
```bash
gcloud auth login
```

## Recursos
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [Docker](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/actions)