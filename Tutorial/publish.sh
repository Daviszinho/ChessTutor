dotnet run --urls='https://localhost:8080'
dotnet  publish ChessTutor.sln -c Release -o ./publish
az webapp deploy --resource-group ChessTutorResourceGroup --name ChessTutor --src-path publish/publish.zip
az webapp deployment source config-zip --resource-group ChessTutorResourceGroup --name ChessTutorApp --src app.zip
