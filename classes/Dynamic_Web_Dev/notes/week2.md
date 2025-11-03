# Week 2 Notes - Dynamic Web Development
---

- SSH (Secure SHell) is actually a server application listening on port 22!
- cd stands for "change directory"

- Manually handling all user requests isn't a good approach because it's very verbose...
  - "It's hard to be thinking at such a low level all the time"
  - Solution: Express!!!
- Express provides us with a set of utilities for managing HTTP requests
  - it allows us to think higher level about what's happening when someone requests our server (HTTP request types!)
  - HTTP Requests:
    - GET 
    - POST
    - PUT
    - DELETE
    - PATCH
    - HEAD
    - OPTIONS
  - In a webpage, Developer Tools, Network, select page -> Headers, you can see the HTTP Request Method
    - 200: good response; 500: bad response
    - Express helps a lot with automatically handling these requests

// Code Example:
// server.js

let express = require('express'); // you need to install express first

// Now, let's have our server respond to get requests with
// the appropriate file from the 'public' folder
// n.b. "public" is a convention for the folder containing front end files which the user can access

let app = express(); // create an http server application which responds to any HTTP request

app.use(express.static('public')); // tell the server to use static files from the 'public' folder

// listen on port 8080
app.listen(8080); // at this point, we've done in 4 lines what took us 26 lines before!



---

// Cleaned Code Example:

let express = require('express');
let app = express();

app.use(express.static('public'));
app.listen(8080);

---

- Let's learn how to hook into user data with more HTTP Requests other than GET

---

let express = require('express');
let app = express();

app.use(express.static('public'));
app.listen(8080);

app.get('/search', myRequestHandler);

function myRequestHandler(req, res) {

    console.log('Got search request');
    res.send('ok');
}

---

- URL Query String, a.k.a. Search Parameters, are the "?q=user+search" part of google.com/search?q=user+search...
- Let's incorporate this into our implementation

---

let express = require('express');
let app = express();

app.use(express.static('public'));
app.listen(8080);

app.get('/search', myRequestHandler);

function myRequestHandler(req, res) {
    let question = req.query.q;
    console.log('Got search request: ', question);
    res.send('Hi! You searched for: ' + question);
}

---

-* N.b. the "res" object is typically expected to be in HTML; if you serve something else, the browser will likely try to retrofit it into HTML
- ejs? (Embedded JavaScript)
- ssr? (Server Side Rendering - React flavored)
- ...wordpress?


- Let's build a POST request handler
---
<!DOCTYPE html>
<html>
<head>
    <title>Form</title>
</head>
<body>
    <h1>Hi!</h1>
    <p>Here's a simple html form:</p>
    <form method="post"  action="/shareSecret">
        <input type="textarea" placeholder="Share a Secret" name="secret"/>
    </form>
<!-- when the user enters the form, the browser will redirect them to the .../shareSecret url -->
<!-- the browser will then send the form data to the "Payload" which you can view with devtools -->
</body>
</html>


// server.js
let express = require('express');
let app = express();

app.use(express.static('public'));
app.listen(8080);

app.get('/search', myRequestHandler);
app.post('/shareSecret', mySecretRequestHandler);

function myRequestHandler(req, res) {
    let question = req.query.q;
    console.log('Got search request: ', question);
    res.send('Hi! You searched for: ' + question);
}

function mySecretRequestHandler(req, res) {
    console.log = (req.body);
    console.log('Got secret request');
    res.send('Thanks for sharing your secret!');

    // print the incoming body JSON data to console
    console.log(req.body);

    // parse the json from the request body
    let json = JSON.parse(req.body);


    let secret = req.body.secret;
    secrets.push(secret);
    console.log('Got POST request to /shareSecret with secret: " + secret);

}
// n.b. this is all using ssr (server side rendering)

// app.use(express.json()); would parse the data into json
// app.use(express.urlencoded({extended: true})); would parse the data into a query string



app.get('/secrets', myGetSecretsRequestHandler);

function myGetSecretsRequestHandler(req, res) {
    res.send(secrets);
}




---

- AJAX (Asynchronous JavaScript and XML)
  - AJAX helps us make HTTP responses without redirecting the browser page
  - We can use AJAX through the fetch API
  - fetch lets us take from an existing webpage, send a request, receive a response, and deal with it within a single browser page without changing pages





