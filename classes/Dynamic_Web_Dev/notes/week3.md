# DWD - Week 3 Notes
---

- r/Place; Collaboration in real time on the web ?
  - Timelapse of a takeover over a week where on a canvas a user can control the color of 1 pixel every 5 minutes
  - wplace.live !
  - lol, Manacugen in Quebec & the 5 dams that power lots of North New York State

-* HTTP Polling -- when the client asks the server for updates, in the case of a live webpage which has data changing and the users can have old data

- Be My Eyes App
- Library of Congress volunteer transcription website
-* How would you implement r/Place? or Be My Eyes? or the LoC website? Specifically just with GET/POST requests?


InClass Coding

- EJS Template -- Express JS Templating -- Using Template Enginges with Express

> npm install pug --save
> npm install ejs




app.set('view-engine', 'ejs'); // this basically sets the express app 'view-engine' configuration to use the 'ejs' view engine

- EJS is like an HTML file, but... not?
  - use <% %> tags to embed JavaScript code when using a .ejs file



---

LEARNING LESSONS AFTER INCLASS CODING

1) Templating is bomb; React is made by Facebook, imported through Next.js; Next runs on Express, and ejs is a basic templater while Next is more fully fledged

2) Make sure everything is being served from the right file locations, and being saving in the right file locations -- understanding how files are statically referenced vs. dynamically templated is actually difficult for you

3) wtf are views? -- views/ is a sibling directory to public/ which contains your template files (such as .ejs); you have to specify the view engine to use the specific one you want (for example, 'ejs')

4) req and res are generic massive class objects characterized by the type of HTTP request or served response communicated between the browser and the server
