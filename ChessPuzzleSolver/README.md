# Navigate to your project directory
cd /home/daviszinho/Documents/ChessTutor/ChessTutor/ChessPuzzleSolver
sudo docker system prune -a --volumes

sudo docker build -t gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver .
sudo docker tag gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver:latest

sudo usermod -aG docker $USER
newgrp docker  # This starts a new shell with the new group
# Build the Docker image
gcloud auth application-default login
sudo docker push gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver:latest


gcloud run deploy chess-puzzle-solver \
  --image gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver \
  --platform managed \
  --region us-central1 \
  --cpu 1 \
  --memory 512Mi \
  --port 3000 \
  --allow-unauthenticated \
  --timeout 300s 