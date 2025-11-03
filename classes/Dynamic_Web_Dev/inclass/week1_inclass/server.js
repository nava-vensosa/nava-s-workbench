let http = require('http'); // establishes script connection via http
let fs = require('fs'); // establishes script access to local file system

let server = http.createServer(myRequestHandler);

server.listen(8080);
function myRequestHandler(req){
    // this is a callback function
        // handles incoming requests
        // generates responses

    console.log(req); // prints req to node terminal console log -- not browser console
}

