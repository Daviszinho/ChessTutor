dotnet run --urls='https://localhost:8085'
dotnet  publish ChessTutor.sln -c Release -o ./publish
az webapp deploy --resource-group ChessTutorResourceGroup --name ChessTutor --src-path publish/publish.zip
az webapp deployment source config-zip --resource-group ChessTutorResourceGroup --name ChessTutorApp --src  publish/publish.zip




cd /home/daviszinho/Documents/ChessTutor/Tutorial
# Stop and remove the existing container if it exists
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker system prune -a --volumes

# Build and run the new container
docker build -t chess-tutor:latest .
docker run -d -p 8085:80 --name chess-tutor chess-tutor:latest



az webapp config container set \
  --name ChessTutorDockerApp \
  --resource-group LinuxDockerResourceGroup \
  --docker-custom-image-name chess-tutor:latest \
  --docker-registry-server-url none \
  --enable-app-service-storage true

az webapp restart --name ChessTutorDockerApp --resource-group LinuxDockerResourceGroup