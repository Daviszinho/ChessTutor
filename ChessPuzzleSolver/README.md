# Navigate to your project directory
cd /home/daviszinho/Documents/ChessTutor/ChessTutor/ChessPuzzleSolver

# Build the Docker image
docker build -t gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver .

gcloud auth login
gcloud config set project idyllic-parser-460423-r0
gcloud auth configure-docker

docker push gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver

gcloud run deploy chess-puzzle-solver \
  --image gcr.io/idyllic-parser-460423-r0/chess-puzzle-solver \
  --platform managed \
  --region us-central1 \
  --cpu 1 \
  --memory 512Mi \
  --port 3000 \
  --allow-unauthenticated \
  --timeout 300s 