# webapp
Prerequisites for building and deploying the application:

Download and install Visual Studio
Download postman
Created an api using nodejs
We need to download and install nodejs and install express, nodemon and npm using the following commands
npm init -y
npm i -D nodemon (nodemon as a dev dependency)
Npm I express
Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs a JavaScript Engine
express is a framework to build the API in javascript

Build and Deploy instructions for the web application:
Run the file using npm run dev
Now the server will be running on port 8000
Call the API using postman
The API to be called is https://localhost:8000/healthz
Can go to terminal and type : curl -v “https://localhost:8000/healthz” as well.
The server should return status 200


