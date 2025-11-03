# Week 1 Notes - Dynamic Web Development

- this is a class on full stack development
- node.js is js
- express.js is a library for server-side processing


- 5x Weekly Assignments + 1x Final Project
- Assignments should be committed to GitHub


- p5 renders something directly to the user within their browser (their computer is running the browser which is running the html)
- The server is able to store data and provide updates for browsers plugged in with an open socket to receive -- that's what node.js is for


- Understanding Networks class gets more into the weeds with this, but here's a high-level overview of how the internet works:


- What is the Internet? --> A global network of computers connected to each other
  - SneakerNet automated with a Cat5 Ethernet Cable between more than 2 devices
  - Think about the work your router does! The router has to "route" internet traffic for several users at the same time -- if yr running large algorithms somewhere between the server and the client, how does the router affect this? Think about playing multiplayer videogames -- that's a lot to run at once! There's the machine, there's the server, and there's the router... 
  - 192.168.100.1 points to the home address for your wifi, 127.0.0.1 points to your machine's local host
  - Internet Protocol defines these requirements... for HTTPS and Gemini alike ?
  - There's a wifi access point which routes you to the main router in the building which connects you to the ISP -- Internet Service Provider (which, when yr at school, is NYU) -- which connects to several other ISPs
    - how much latency does this introduce? What about international connections?


- "> traceroute [link]" in terminal will output all the different nodes between your current computer and the domain you type in
- "> ping" will give you a measurement of the time latency (it's literally ping-pong; the server will pong yr ping)
  - this is a way of monitoring latency between ISP connections... but how do you account for runtime? Is it harder on a browser to run than perhaps a WASM backend? how bad would the latency be? Would you want to have the user download an executable to their device which their device could access from browser, such as a resource pack?


- IP defines the structure of message routing; TCP defines the structure of the messages themselves (Transmission Control Protocol)
  - UDP and QUIC are quicker alternatives to TCP, with different drawbacks
  - You have to consider signal loss at some point if you're using a riskier protocol like UDP or QUIC... QUIC might be safer than UDP, though more complex to design or construct


- How are domain name's identified and sorted so your machine can access the appropriate server for the user's request? What kind of data lookup table is that? is that a data lookup table?
- A server is just a computer running a server application; users can access information streaming out of these applications as well as send information into them
  - "Response" and "Request"
    - like: "Give me "this.html"" or "Give me this video file" or "Change my username"... these are requests, to which the server responds


- HTTPS: Hypertext Transfer Protocol (Secure)
- URL: Uniform Resource Locator
  - the URL resolves to the IP Address... perhaps not a lookup table... but still, how does it route there?
    - This is DNS Resolution! Domain Name System resolution
    - 1) Local Check 2) Query a recursive DNS resolver from your ISP 3) ISP makes iterative queries to TLD (Top Level Domain root) 4) authoritative name server queried to get IP Address 5) IP Address returned to  browser and cached for future use
    - 1) You enter a URL into a web browser 2) The browser looks up the IP address for the domain name via DNS 3) The browser sends a HTTP request to the server 4) The server sends back a HTTP response 5) 


- Cloud Infrastructure?
- The Cloud is a very material, physical thing which consumes extensive land, electricity, and water
  - Data Centers! Like in Northern Virginia, where Google keeps many of their East Coast servers
  - Digital Ocean's headquarters are in downtown Manhattan


- TCP vs. HLS vs. HTTP & Websockets(TCP) vs. UDP, etc.



INCLASS EXAMPLE:
1. Practice writing javascripts manually and running them in terminal with node script.js
  - try to get some difficult algorithms just like that, you need the practice
2. Serve the index.html off server.js run with node


ASSIGNMENT:
1. Create DigitalOcean Account
2. Run the Node.js server on the publicly accessible DigitalOcean IP Address serving your HTML
