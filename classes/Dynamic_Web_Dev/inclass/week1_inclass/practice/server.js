// server.js

let http = require('http'); // establishes this script via http connection
let fs = require('fs'); // establishes local machine file server connection

let server = http.createServer(requestHandler); // binds server, passes requestHandler() into it

server.listen(8080); // runs server on localhost:8080

function requestHandler(req){
    console.log(req);
} // request handler function -- allows browsers to request connection
