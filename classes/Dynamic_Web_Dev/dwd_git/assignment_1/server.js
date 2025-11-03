// server.js -- Launch Node.js Server

let http = require("http");
let fs = require("fs");
let path = require("path");

let server = http.createServer(requestHandler);

server.listen(8080);

function requestHandler(req, res){
    let filepath = path.join(__dirname, req.url + "index.html");
    console.log('DEBUG - Requested url:', req.url);
    fs.readFile(filepath, res.writeHead(200, {'Content-Type': 'text/html'}));
}

